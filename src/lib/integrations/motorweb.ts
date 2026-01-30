import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import https from 'https';

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
 */
export async function fetchMotorWebIdentity(plateOrVin: string): Promise<MotorWebIdentity> {
  const passphrase = process.env.MOTORWEB_P12_PASSPHRASE;

  if (!passphrase) {
    throw new Error('MotorWeb mTLS passphrase missing');
  }

  let pfx: Buffer;
  const p12Path = path.join(process.cwd(), 'motorweb.p12');

  if (fs.existsSync(p12Path)) {
    pfx = fs.readFileSync(p12Path);
    console.log('PFX Hex (File):', pfx.slice(0, 4).toString('hex'));
  } else if (process.env.MOTORWEB_P12_B64 && process.env.MOTORWEB_P12_B64 !== 'small') {
    pfx = Buffer.from(process.env.MOTORWEB_P12_B64, 'base64');
    console.log('PFX Hex (Env):', pfx.slice(0, 4).toString('hex'));
  } else {
    throw new Error('MotorWeb mTLS certificate missing');
  }

  const url = `https://robot.motorweb.co.nz/b2b/chassischeck/generate/4.0?plateOrVin=${encodeURIComponent(plateOrVin)}`;

  return new Promise((resolve, reject) => {
    const options = {
      pfx,
      passphrase,
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
        'User-Agent': 'MobileAutoworksNZ/1.1',
      }
    };

    console.log('Requesting MotorWeb via https.request...');
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(parseMotorWebXml(data));
          } catch (e) {
            reject(new Error('Failed to parse MotorWeb XML: ' + (e as Error).message));
          }
        } else {
          reject(new Error(`MotorWeb API error: ${res.statusCode} ${res.statusMessage}. Data: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('MotorWeb Request Error:', e);
      reject(e);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('MotorWeb request timed out'));
    });

    req.end();
  });
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
