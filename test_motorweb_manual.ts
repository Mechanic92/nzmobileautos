
import { fetchMotorWebIdentity } from './src/lib/integrations/motorweb';
import { PrismaClient } from "@prisma/client";

// Mock environment variables if running locally and they aren't loaded automatically by tsx
// (Assuming tsx loads .env or we rely on them being in the system/pnpm environment)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const plate = "KRB400"; // Using the plate the user mentioned
  console.log(`Testing MotorWeb lookup for ${plate}...`);
  try {
    const result = await fetchMotorWebIdentity(plate);
    console.log("Success:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("MotorWeb Test Failed:", error);
    if (error.cause) console.error("Cause:", error.cause);
  }
}

main();
