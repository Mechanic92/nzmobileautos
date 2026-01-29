
import { fetch } from 'undici';

async function main() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('1. Creating Quote...');
  
  const quoteRes = await fetch(`${baseUrl}/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plate: 'KRB400',
      email: 'test@example.com',
      serviceMode: 'SERVICE',
      serviceKey: 'BASIC',
      classification: {
        fuel_class: 'DIESEL',
        body_class: 'UTE'
      }
    })
  });

  if (!quoteRes.ok) {
    console.error('Quote failed:', await quoteRes.text());
    return;
  }

  const quoteData: any = await quoteRes.json();
  const quoteId = quoteData.id;
  console.log(`Quote Created: ${quoteId}`);

  console.log('2. Fetching Quote Details...');
  const detailsRes = await fetch(`${baseUrl}/quote/${quoteId}`);
  if (!detailsRes.ok) {
    console.error('Get Quote failed:', await detailsRes.text());
    return;
  }
  const details: any = await detailsRes.json();
  console.log('Quote Details Retrieved (Vehicle):', details.vehicle?.plate);

  console.log('3. Creating Stripe Session (Booking)...');
  const sessionRes = await fetch(`${baseUrl}/stripe/session`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000'
    },
    body: JSON.stringify({
      quoteId,
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '0211234567',
        line1: '123 Test St',
        suburb: 'Mount Eden'
      },
      startTime: new Date(Date.now() + 86400000 * (2 + Math.random() * 5)).toISOString() 
    })
  });

  if (!sessionRes.ok) {
    console.error('Session failed:', await sessionRes.text());
    return;
  }

  const sessionData: any = await sessionRes.json();
  console.log('Stripe Session Created URL:', sessionData.url);
}

main().catch(console.error);
