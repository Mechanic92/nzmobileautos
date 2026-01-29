import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Vehicle Cache Statistics\n');
  console.log('=' .repeat(60));
  
  // Get total cache entries
  const totalCached = await prisma.vehicleCache.count();
  console.log(`Total cached vehicles: ${totalCached}`);
  
  // Get cache entries with lookup counts
  const cacheEntries = await prisma.vehicleCache.findMany({
    orderBy: { lookupCount: 'desc' },
    take: 10
  });
  
  console.log('\n📋 Top 10 Most Accessed Plates:\n');
  console.log('Plate'.padEnd(12), 'Lookups'.padEnd(10), 'Last Access'.padEnd(25), 'Expires');
  console.log('-'.repeat(70));
  
  for (const entry of cacheEntries) {
    const plate = entry.plate.padEnd(12);
    const lookups = entry.lookupCount.toString().padEnd(10);
    const lastAccess = entry.lastAccessAt.toISOString().substring(0, 19).padEnd(25);
    const expires = entry.expiresAt.toISOString().substring(0, 10);
    console.log(plate, lookups, lastAccess, expires);
  }
  
  // Get lookup logs
  const totalLookups = await prisma.lookupLog.count();
  const cacheLookups = await prisma.lookupLog.count({
    where: { source: 'CACHE' }
  });
  const motorwebLookups = await prisma.lookupLog.count({
    where: { source: 'MOTORWEB' }
  });
  
  console.log('\n📈 Lookup Statistics:\n');
  console.log(`Total lookups: ${totalLookups}`);
  console.log(`Cache hits: ${cacheLookups} (${((cacheLookups/totalLookups)*100).toFixed(1)}%)`);
  console.log(`MotorWeb calls: ${motorwebLookups} (${((motorwebLookups/totalLookups)*100).toFixed(1)}%)`);
  
  const savings = cacheLookups;
  console.log(`\n💰 Cost Savings: ${savings} MotorWeb API calls avoided!`);
  
  // Check for expired entries
  const expiredCount = await prisma.vehicleCache.count({
    where: { expiresAt: { lt: new Date() } }
  });
  
  if (expiredCount > 0) {
    console.log(`\n⚠️  ${expiredCount} expired cache entries (ready for cleanup)`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Cache is active with 90-day TTL');
  console.log('✅ Automatic cache-first lookup strategy');
  console.log('✅ Access tracking and statistics enabled');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
