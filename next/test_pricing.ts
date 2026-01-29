import { classifyVehicle } from './src/lib/engines/classification';
import { generateQuote } from './src/lib/engines/pricing';

// Simulate the Ssangyong Actyon data
const motorwebData = {
  make: 'Ssangyong',
  model: 'Actyon Sport Sports Manual 2.2 2.',
  year: 2017,
  fuel: 'Diesel',
  power_kw: 131,
  body_style: 'Utility',
  gvm: 2740,
  vin: 'KPADA1EESGP293104',
  plate: 'KRB400'
};

console.log('Testing Pricing for Ssangyong Actyon\n');
console.log('Vehicle Data:', motorwebData);
console.log('\n--- Classification ---');

const classification = classifyVehicle(motorwebData);
console.log(JSON.stringify(classification, null, 2));

console.log('\n--- Pricing ---');
const basicQuote = generateQuote('SERVICE', classification, 'BASIC');
console.log('BASIC Service:', `$${basicQuote.total}`);

const comprehensiveQuote = generateQuote('SERVICE', classification, 'COMPREHENSIVE');
console.log('COMPREHENSIVE Service:', `$${comprehensiveQuote.total}`);

console.log('\n--- Expected ---');
console.log('BASIC DIESEL COMMERCIAL: $325');
console.log('COMPREHENSIVE DIESEL COMMERCIAL: $445');
