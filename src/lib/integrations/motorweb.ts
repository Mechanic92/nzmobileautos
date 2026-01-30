import forge from 'node-forge';
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
  const passphrase =
    process.env.MOTORWEB_ROBOT_P12_PASSPHRASE ||
    process.env.MOTORWEB_P12_PASSPHRASE;

  if (!passphrase) {
    throw new Error('MotorWeb mTLS passphrase missing');
  }

  let pfx: Buffer;
  const p12Path =
    process.env.MOTORWEB_ROBOT_P12_PATH ||
    process.env.MOTORWEB_P12_PATH ||
    path.join(process.cwd(), 'motorweb.p12');

  if (fs.existsSync(p12Path)) {
    pfx = fs.readFileSync(p12Path);
  } else if (
    (process.env.MOTORWEB_ROBOT_P12_BASE64 && process.env.MOTORWEB_ROBOT_P12_BASE64 !== 'small') ||
    (process.env.MOTORWEB_P12_B64 && process.env.MOTORWEB_P12_B64 !== 'small')
  ) {
    const b64 = process.env.MOTORWEB_ROBOT_P12_BASE64 || process.env.MOTORWEB_P12_B64;
    if (!b64) throw new Error('MotorWeb mTLS certificate missing');
    pfx = Buffer.from(b64, 'base64');
  } else {
    throw new Error('MotorWeb mTLS certificate missing');
  }

  // Use node-forge to handle legacy PKCS12 encryption
  let keyPem: string;
  let certPem: string;
  try {
    const p12Der = pfx.toString('binary');
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);

    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
    if (!keyBag) throw new Error('No key bag found in P12');
    keyPem = forge.pki.privateKeyToPem(keyBag.key);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBag = certBags[forge.pki.oids.certBag]?.[0];
    if (!certBag) throw new Error('No cert bag found in P12');
    certPem = forge.pki.certificateToPem(certBag.cert);
  } catch (err: any) {
    throw new Error(`Failed to decrypt P12 with node-forge: ${err.message}`);
  }

  const baseUrl = process.env.MOTORWEB_ROBOT_BASE_URL || 'https://robot.motorweb.co.nz';
  const url = `${baseUrl}/b2b/chassischeck/generate/4.0?plateOrVin=${encodeURIComponent(plateOrVin)}`;

  return new Promise((resolve, reject) => {
    const options = {
      key: keyPem,
      cert: certPem,
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
        'User-Agent': 'MobileAutoworksNZ/1.2',
      }
    };

    // If switching to undici, this block would be relevant:
    /*
    let dispatcher;
    try {
      dispatcher = new Agent({
        connect: {
          pfx,
          passphrase,
          servername: 'robot.motorweb.co.nz',
        },
      });
    } catch (e: any) {
      const pfxSummary = pfx ? pfx.slice(0, 16).toString('hex') : 'null';
      const pfxSize = pfx ? pfx.length : 0;
      throw new Error(`Failed to create Agent: ${e.message} (PFX size: ${pfxSize}, Hex: ${pfxSummary})`);
    }
    // Then use dispatcher for the request, e.g., fetch(url, { dispatcher, ... })
    */

    console.log('Requesting MotorWeb via https.request...');
    try {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(parseMotorWebXml(data));
            } catch (e: any) {
              reject(new Error(`Failed to parse MotorWeb XML: ${e.message}`));
            }
          } else {
            reject(new Error(`MotorWeb API error: ${res.statusCode} ${res.statusMessage}. Data: ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        const hex = pfx.slice(0, 16).toString('hex');
        const size = pfx.length;
        console.error('MotorWeb Request Error:', e.message, 'PFX Size:', size, 'Hex:', hex);
        reject(new Error(`MotorWeb Request Error: ${e.message} (PFX size: ${size}, Hex: ${hex})`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('MotorWeb request timed out'));
      });

      req.end();
    } catch (e: any) {
      const hex = pfx.slice(0, 16).toString('hex');
      const size = pfx.length;
      reject(new Error(`Synchronous https.request Error: ${e.message} (PFX size: ${size}, Hex: ${hex})`));
    }
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
