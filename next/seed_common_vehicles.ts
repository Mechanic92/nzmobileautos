import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with common NZ vehicles...\n');

  // Common NZ vehicle data (no API calls needed - using typical NZ fleet data)
  const commonVehicles = [
    // Popular Toyota models
    { plate: 'ABC123', make: 'Toyota', model: 'Corolla', year: 2018, fuel: 'Petrol', power_kw: 103, body_style: 'Sedan', gvm: 1500, vin: 'JTDBR32E300000001' },
    { plate: 'XYZ789', make: 'Toyota', model: 'RAV4', year: 2020, fuel: 'Petrol', power_kw: 127, body_style: 'SUV', gvm: 2080, vin: 'JTMRFREV5KD000001' },
    { plate: 'DEF456', make: 'Toyota', model: 'Hilux', year: 2019, fuel: 'Diesel', power_kw: 130, body_style: 'Utility', gvm: 3090, vin: 'MR0FZ22G000000001' },
    
    // Popular Mazda models
    { plate: 'GHI789', make: 'Mazda', model: 'Demio', year: 2015, fuel: 'Petrol', power_kw: 75, body_style: 'Hatchback', gvm: 1380, vin: 'JMZDE14A000000001' },
    { plate: 'JKL012', make: 'Mazda', model: 'CX-5', year: 2021, fuel: 'Petrol', power_kw: 140, body_style: 'SUV', gvm: 2000, vin: 'JM3KFBDM0M0000001' },
    { plate: 'MNO345', make: 'Mazda', model: 'BT-50', year: 2020, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3200, vin: 'MM0UY28G000000001' },
    
    // Popular Honda models
    { plate: 'PQR678', make: 'Honda', model: 'Fit', year: 2017, fuel: 'Petrol', power_kw: 97, body_style: 'Hatchback', gvm: 1420, vin: 'JHMGK5H50HC000001' },
    { plate: 'STU901', make: 'Honda', model: 'CR-V', year: 2019, fuel: 'Petrol', power_kw: 140, body_style: 'SUV', gvm: 2015, vin: 'JHLRW2H80KC000001' },
    
    // Popular Nissan models
    { plate: 'VWX234', make: 'Nissan', model: 'Leaf', year: 2018, fuel: 'Electric', power_kw: 110, body_style: 'Hatchback', gvm: 1940, vin: 'SJKCA0E51J0000001' },
    { plate: 'YZA567', make: 'Nissan', model: 'Navara', year: 2019, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3130, vin: 'JN1TANT32U0000001' },
    { plate: 'BCD890', make: 'Nissan', model: 'X-Trail', year: 2020, fuel: 'Petrol', power_kw: 126, body_style: 'SUV', gvm: 2135, vin: 'JN1BANT32U0000001' },
    
    // Popular Ford models
    { plate: 'EFG123', make: 'Ford', model: 'Ranger', year: 2021, fuel: 'Diesel', power_kw: 157, body_style: 'Utility', gvm: 3200, vin: 'WFOEXXGBFEKF00001' },
    { plate: 'HIJ456', make: 'Ford', model: 'Focus', year: 2016, fuel: 'Petrol', power_kw: 92, body_style: 'Hatchback', gvm: 1750, vin: 'WF0SXXGBFS6F00001' },
    
    // Popular Holden models
    { plate: 'KLM789', make: 'Holden', model: 'Colorado', year: 2018, fuel: 'Diesel', power_kw: 147, body_style: 'Utility', gvm: 3050, vin: '6G5TD69E0H0000001' },
    
    // Popular Mitsubishi models
    { plate: 'NOP012', make: 'Mitsubishi', model: 'Outlander', year: 2019, fuel: 'Petrol', power_kw: 124, body_style: 'SUV', gvm: 2240, vin: 'JA4J3VA89KZ000001' },
    { plate: 'QRS345', make: 'Mitsubishi', model: 'Triton', year: 2020, fuel: 'Diesel', power_kw: 133, body_style: 'Utility', gvm: 3100, vin: 'MMBJNKB40KH000001' },
    
    // Popular Hyundai models
    { plate: 'TUV678', make: 'Hyundai', model: 'i30', year: 2018, fuel: 'Petrol', power_kw: 99, body_style: 'Hatchback', gvm: 1665, vin: 'KMHD35LE4JU000001' },
    { plate: 'WXY901', make: 'Hyundai', model: 'Tucson', year: 2021, fuel: 'Petrol', power_kw: 130, body_style: 'SUV', gvm: 2045, vin: 'KMHJ381CBMU000001' },
    
    // Popular Kia models
    { plate: 'ZAB234', make: 'Kia', model: 'Sportage', year: 2020, fuel: 'Petrol', power_kw: 135, body_style: 'SUV', gvm: 2205, vin: 'KNDPM3AC8L7000001' },
    
    // Popular Subaru models
    { plate: 'CDE567', make: 'Subaru', model: 'Outback', year: 2019, fuel: 'Petrol', power_kw: 129, body_style: 'SUV', gvm: 2270, vin: '4S4BSANC5K3000001' },
    { plate: 'FGH890', make: 'Subaru', model: 'Forester', year: 2020, fuel: 'Petrol', power_kw: 136, body_style: 'SUV', gvm: 2270, vin: 'JF2SKADC6LH000001' },
    
    // Popular Volkswagen models
    { plate: 'IJK123', make: 'Volkswagen', model: 'Golf', year: 2017, fuel: 'Petrol', power_kw: 92, body_style: 'Hatchback', gvm: 1890, vin: 'WVWZZZAUZJW000001' },
    { plate: 'LMN456', make: 'Volkswagen', model: 'Amarok', year: 2019, fuel: 'Diesel', power_kw: 132, body_style: 'Utility', gvm: 3040, vin: 'WV1ZZZ2HZKP000001' },
    
    // Popular Suzuki models
    { plate: 'OPQ789', make: 'Suzuki', model: 'Swift', year: 2018, fuel: 'Petrol', power_kw: 66, body_style: 'Hatchback', gvm: 1235, vin: 'JSAAZC83S00000001' },
    
    // Popular Isuzu models
    { plate: 'RST012', make: 'Isuzu', model: 'D-Max', year: 2021, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3100, vin: 'MPATFS85KJK000001' },
    
    // Test vehicle (already used)
    { plate: 'KRB400', make: 'Ssangyong', model: 'Actyon Sport Sports Manual 2.2 2.', year: 2017, fuel: 'Diesel', power_kw: 131, body_style: 'Utility', gvm: 2740, vin: 'KPADA1EESGP293104' },
  ];

  console.log(`Preparing to cache ${commonVehicles.length} common NZ vehicles...\n`);

  let added = 0;
  let skipped = 0;

  for (const vehicle of commonVehicles) {
    try {
      // Check if already exists
      const existing = await prisma.vehicleCache.findUnique({
        where: { plate: vehicle.plate }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create cache entry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90); // 90-day TTL

      // Build identity JSON
      const identityJson = {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        fuel: vehicle.fuel,
        power_kw: vehicle.power_kw,
        body_style: vehicle.body_style,
        gvm: vehicle.gvm,
        vin: vehicle.vin,
        plate: vehicle.plate
      };

      // Classify vehicle
      const body = vehicle.body_style.toUpperCase();
      const fuel = vehicle.fuel.toUpperCase();
      
      let fuel_class: 'PETROL' | 'DIESEL' | 'EV' = 'PETROL';
      if (fuel.includes('DIESEL')) fuel_class = 'DIESEL';
      if (fuel.includes('ELECTRIC') || fuel === 'EV') fuel_class = 'EV';

      let body_class: 'CAR' | 'SUV' | 'UTE' | 'VAN' | 'PERFORMANCE' | 'COMMERCIAL' = 'CAR';
      if (body.includes('SUV')) body_class = 'SUV';
      if (body.includes('UTE') || body.includes('UTILITY')) body_class = 'UTE';
      if (body.includes('VAN')) body_class = 'VAN';
      if (body.includes('HATCHBACK') || body.includes('SEDAN')) body_class = 'CAR';

      let power_band: 'LOW' | 'MID' | 'HIGH' = 'LOW';
      if (vehicle.power_kw > 120) power_band = 'MID';
      if (vehicle.power_kw > 200) {
        power_band = 'HIGH';
        body_class = 'PERFORMANCE';
      }

      let load_class: 'LIGHT' | 'HEAVY' = 'LIGHT';
      const isDieselComm = fuel_class === 'DIESEL' && (body_class === 'UTE' || body_class === 'VAN');
      if (vehicle.gvm > 3500 || isDieselComm) {
        load_class = 'HEAVY';
        body_class = 'COMMERCIAL';
      }

      const classificationJson = {
        fuel_class,
        body_class,
        load_class,
        power_band
      };

      await prisma.vehicleCache.create({
        data: {
          plate: vehicle.plate,
          identityJson: identityJson as any,
          classificationJson: classificationJson as any,
          expiresAt,
          lookupCount: 0,
          lastAccessAt: new Date()
        }
      });

      added++;
      console.log(`✅ ${vehicle.plate.padEnd(8)} - ${vehicle.year} ${vehicle.make} ${vehicle.model.substring(0, 20)}`);

    } catch (error: any) {
      console.error(`❌ Failed to add ${vehicle.plate}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Added: ${added} vehicles`);
  console.log(`⏭️  Skipped: ${skipped} (already cached)`);
  console.log(`📊 Total cache size: ${added + skipped} vehicles`);
  console.log('='.repeat(60));
  console.log('\n💡 These vehicles will now return instantly without MotorWeb API calls!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
