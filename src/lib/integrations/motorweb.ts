import { Agent, fetch as undiciFetch } from 'undici';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

export type MotorWebIdentity = {
  make: string;
  model: string;
  year: number;
  fuel: string;
  power_kw: number;
  body_style: string;
  gvm: number;
  vin: string;
  plate: string;
};

/**
 * Fetches vehicle identity from MotorWeb using mTLS.
 * Implements timeout (5-8s) and 1-retry logic.
 */
export async function fetchMotorWebIdentity(plateOrVin: string): Promise<MotorWebIdentity> {
  const passphrase = process.env.MOTORWEB_P12_PASSPHRASE;

  if (!passphrase) {
    throw new Error('MotorWeb mTLS passphrase (MOTORWEB_P12_PASSPHRASE) missing on server');
  }

  let pfx: Buffer;
  const p12Path = path.join(process.cwd(), 'motorweb.p12');

  if (fs.existsSync(p12Path)) {
    pfx = fs.readFileSync(p12Path);
  } else if (process.env.MOTORWEB_P12_B64) {
    pfx = Buffer.from(process.env.MOTORWEB_P12_B64, 'base64');
  } else {
    throw new Error('MotorWeb mTLS certificate missing. Expected file at src/lib/integrations/motorweb.p12');
  }

  const dispatcher = new Agent({
    connect: {
      pfx,
      passphrase,
    },
  });

  const url = `https://robot.motorweb.co.nz/b2b/chassischeck/generate/4.0?plateOrVin=${encodeURIComponent(plateOrVin)}`;

  const makeRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      console.log('Sending MotorWeb request...');
      const response = await undiciFetch(url, {
        method: 'GET',
        // @ts-ignore
        dispatcher,
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml',
        },
      });
      console.log('Received response:', response.status);

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`MotorWeb API error: ${response.status} ${response.statusText}`);
      }

      const xmlData = await response.text();
      return parseMotorWebXml(xmlData);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Request failed:', error.message);
      throw error;
    }
  };

  // 1-Retry Logic
  try {
    return await makeRequest();
  } catch (err) {
    console.warn('MotorWeb first attempt failed, retrying...', err);
    return await makeRequest();
  }
}

function parseMotorWebXml(xml: string): MotorWebIdentity {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const jsonObj = parser.parse(xml);
  
  const vir = jsonObj?.vir?.["vir-analysis"] || {};
  const vehicle = vir.vehicle || {};

  return {
    make: vehicle.make || 'Unknown',
    model: vehicle.model || 'Unknown',
    year: parseInt(vehicle["year-of-manufacture"]?.value || vehicle.year || '0'),
    fuel: vehicle["fuel-type"]?.["#text"] || vehicle["fuel-type"]?.value || 'Unknown',
    power_kw: parseInt(vehicle.power?.value || '0'),
    body_style: vehicle["body-style"]?.["#text"] || vehicle["body-style"] || 'Unknown',
    gvm: parseInt(vehicle["gross-vehicle-mass"]?.value || '0'),
    vin: vehicle.vin || '',
    plate: vehicle.registration?.plate || '', // Note: plate might come back in the XML if input was VIN
  };
}
