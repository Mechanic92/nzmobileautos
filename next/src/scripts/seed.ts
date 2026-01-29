/**
 * Database Seed Script
 * Seeds initial data for service packages, zones, and sample parts
 * 
 * Run with: npx tsx src/scripts/seed.ts
 */

// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedServicePackages() {
  console.log("Seeding service packages...");

  const packages = [
    {
      code: "DIAGNOSTIC",
      name: "Mobile Diagnostics",
      description: "Comprehensive OBD2 scan, fault code analysis, live data review, and written report",
      baseLabourMinutes: 60,
      baseLabourCents: 9500,
      callOutCents: 4000,
      includedItems: [
        "Full ECU scan (engine, transmission, ABS, SRS, body)",
        "Live data stream analysis",
        "Fault code interpretation",
        "Written diagnostic report",
        "Repair recommendations with pricing",
      ],
      warrantyMonths: 0,
      warrantyKm: 0,
      sortOrder: 1,
    },
    {
      code: "PPI",
      name: "Pre-Purchase Inspection",
      description: "Comprehensive 150+ point inspection before you buy",
      baseLabourMinutes: 90,
      baseLabourCents: 14250,
      callOutCents: 4000,
      includedItems: [
        "Engine bay inspection",
        "Cooling system check",
        "Brake system assessment",
        "Steering & suspension check",
        "Tyre condition & tread depth",
        "Body & paint inspection",
        "Interior & electronics check",
        "Road test",
        "OBD2 diagnostic scan",
        "Detailed PDF report with photos",
      ],
      warrantyMonths: 0,
      warrantyKm: 0,
      sortOrder: 2,
    },
    {
      code: "BRONZE_SERVICE",
      name: "Bronze Service",
      description: "Essential oil & filter change with safety check",
      baseLabourMinutes: 45,
      baseLabourCents: 7125,
      callOutCents: 4000,
      includedItems: [
        "Engine oil change (quality synthetic blend)",
        "Oil filter replacement",
        "Drain washer replacement",
        "Fluid level check & top-up",
        "Tyre pressure check",
        "Visual brake inspection",
        "Battery health check",
        "Exterior light check",
      ],
      warrantyMonths: 6,
      warrantyKm: 10000,
      sortOrder: 3,
    },
    {
      code: "SILVER_SERVICE",
      name: "Silver Service",
      description: "Comprehensive service with air filter and detailed inspection",
      baseLabourMinutes: 75,
      baseLabourCents: 11875,
      callOutCents: 4000,
      includedItems: [
        "Everything in Bronze Service",
        "Air filter replacement",
        "Cabin/pollen filter check",
        "Brake pad thickness measurement",
        "Suspension inspection",
        "Steering check",
        "Cooling system inspection",
        "Drive belt inspection",
        "Detailed service report",
      ],
      warrantyMonths: 6,
      warrantyKm: 10000,
      sortOrder: 4,
    },
    {
      code: "GOLD_SERVICE",
      name: "Gold Service",
      description: "Full major service with all filters and comprehensive inspection",
      baseLabourMinutes: 120,
      baseLabourCents: 19000,
      callOutCents: 4000,
      includedItems: [
        "Everything in Silver Service",
        "Cabin/pollen filter replacement",
        "Spark plug inspection/replacement (if due)",
        "Fuel filter inspection",
        "Transmission fluid check",
        "Differential fluid check",
        "Brake fluid condition test",
        "Coolant condition test",
        "Full diagnostic scan",
        "Road test",
      ],
      warrantyMonths: 12,
      warrantyKm: 20000,
      sortOrder: 5,
    },
    {
      code: "BRAKE_PADS_FRONT",
      name: "Front Brake Pad Replacement",
      description: "Replace front brake pads with quality aftermarket or OEM parts",
      baseLabourMinutes: 60,
      baseLabourCents: 9500,
      callOutCents: 4000,
      includedItems: [
        "Remove and inspect front brake rotors",
        "Replace front brake pads",
        "Clean and lubricate caliper slides",
        "Bed-in procedure advice",
      ],
      warrantyMonths: 12,
      warrantyKm: 20000,
      sortOrder: 6,
    },
    {
      code: "BRAKE_PADS_REAR",
      name: "Rear Brake Pad Replacement",
      description: "Replace rear brake pads with quality aftermarket or OEM parts",
      baseLabourMinutes: 60,
      baseLabourCents: 9500,
      callOutCents: 4000,
      includedItems: [
        "Remove and inspect rear brake rotors",
        "Replace rear brake pads",
        "Clean and lubricate caliper slides",
        "Bed-in procedure advice",
      ],
      warrantyMonths: 12,
      warrantyKm: 20000,
      sortOrder: 7,
    },
    {
      code: "BRAKE_PADS_FULL",
      name: "Full Brake Pad Replacement",
      description: "Replace all brake pads (front and rear)",
      baseLabourMinutes: 105,
      baseLabourCents: 16625,
      callOutCents: 4000,
      includedItems: [
        "Remove and inspect all brake rotors",
        "Replace front and rear brake pads",
        "Clean and lubricate all caliper slides",
        "Brake fluid level check",
        "Bed-in procedure advice",
      ],
      warrantyMonths: 12,
      warrantyKm: 20000,
      sortOrder: 8,
    },
    {
      code: "BATTERY_REPLACEMENT",
      name: "Battery Replacement",
      description: "Supply and fit new battery with correct specifications",
      baseLabourMinutes: 30,
      baseLabourCents: 4750,
      callOutCents: 4000,
      includedItems: [
        "Battery health test",
        "Remove old battery",
        "Clean terminals",
        "Install new battery",
        "System reset if required",
        "Old battery disposal",
      ],
      warrantyMonths: 24,
      warrantyKm: 0,
      sortOrder: 9,
    },
  ];

  for (const pkg of packages) {
    await prisma.servicePackageConfig.upsert({
      where: { code: pkg.code as any },
      create: {
        code: pkg.code as any,
        name: pkg.name,
        description: pkg.description,
        baseLabourMinutes: pkg.baseLabourMinutes,
        baseLabourCents: pkg.baseLabourCents,
        callOutCents: pkg.callOutCents,
        includedItems: pkg.includedItems,
        warrantyMonths: pkg.warrantyMonths,
        warrantyKm: pkg.warrantyKm,
        sortOrder: pkg.sortOrder,
      },
      update: {
        name: pkg.name,
        description: pkg.description,
        baseLabourMinutes: pkg.baseLabourMinutes,
        baseLabourCents: pkg.baseLabourCents,
        callOutCents: pkg.callOutCents,
        includedItems: pkg.includedItems,
        warrantyMonths: pkg.warrantyMonths,
        warrantyKm: pkg.warrantyKm,
        sortOrder: pkg.sortOrder,
      },
    });
  }

  console.log(`Seeded ${packages.length} service packages`);
}

async function seedGeographicZones() {
  console.log("Seeding geographic zones...");

  const zones = [
    {
      zone: "NORTH_SHORE",
      name: "North Shore",
      suburbs: [
        "Albany", "Birkenhead", "Beach Haven", "Bayswater", "Browns Bay",
        "Castor Bay", "Chatswood", "Devonport", "Forrest Hill", "Glenfield",
        "Greenhithe", "Hillcrest", "Long Bay", "Mairangi Bay", "Milford",
        "Murrays Bay", "Northcote", "Northcross", "Pinehill", "Rosedale",
        "Rothesay Bay", "Schnapper Rock", "Sunnynook", "Takapuna", "Torbay",
        "Unsworth Heights", "Wairau Valley", "Westlake",
      ],
      preferredDays: ["MONDAY", "THURSDAY"],
      travelBufferMinutes: 30,
      surchargeCents: 0,
    },
    {
      zone: "WEST_AUCKLAND",
      name: "West Auckland",
      suburbs: [
        "Avondale", "Blockhouse Bay", "Glen Eden", "Glendene", "Green Bay",
        "Henderson", "Hobsonville", "Huapai", "Kelston", "Kumeu",
        "Lincoln", "Massey", "New Lynn", "Ranui", "Riverhead",
        "Sunnyvale", "Swanson", "Te Atatu", "Te Atatu Peninsula", "Te Atatu South",
        "Titirangi", "Waitakere", "West Harbour", "Westgate", "Whenuapai",
      ],
      preferredDays: ["TUESDAY", "FRIDAY"],
      travelBufferMinutes: 25,
      surchargeCents: 0,
    },
    {
      zone: "CENTRAL",
      name: "Central Auckland",
      suburbs: [
        "Auckland CBD", "Arch Hill", "Eden Terrace", "Ellerslie", "Epsom",
        "Freemans Bay", "Grafton", "Greenlane", "Grey Lynn", "Herne Bay",
        "Kingsland", "Meadowbank", "Mission Bay", "Mt Albert", "Mt Eden",
        "Mt Roskill", "Mt Wellington", "Newmarket", "Onehunga", "Orakei",
        "Parnell", "Penrose", "Point Chevalier", "Ponsonby", "Remuera",
        "Royal Oak", "Sandringham", "St Heliers", "St Johns", "Three Kings",
        "Waterview", "Westmere",
      ],
      preferredDays: ["WEDNESDAY"],
      travelBufferMinutes: 20,
      surchargeCents: 0,
    },
    {
      zone: "EAST_AUCKLAND",
      name: "East Auckland",
      suburbs: [
        "Beachlands", "Botany Downs", "Bucklands Beach", "Cockle Bay",
        "Dannemora", "East Tamaki", "Farm Cove", "Flat Bush", "Glen Innes",
        "Half Moon Bay", "Howick", "Maraetai", "Mellons Bay", "Pakuranga",
        "Panmure", "Point England", "Shelly Park", "Somerville", "Sunnyhills",
        "Whitford",
      ],
      preferredDays: ["THURSDAY"],
      travelBufferMinutes: 35,
      surchargeCents: 3000,
    },
    {
      zone: "SOUTH_AUCKLAND",
      name: "South Auckland",
      suburbs: [
        "Airport Oaks", "Clendon Park", "Clover Park", "Drury", "Favona",
        "Flat Bush", "Goodwood Heights", "Hillpark", "Mangere", "Mangere Bridge",
        "Mangere East", "Manukau", "Manurewa", "Otahuhu", "Otara",
        "Papatoetoe", "Papakura", "Pukekohe", "Randwick Park", "Takanini",
        "The Gardens", "Totara Heights", "Wattle Downs", "Weymouth", "Wiri",
      ],
      preferredDays: ["FRIDAY"],
      travelBufferMinutes: 40,
      surchargeCents: 3000,
    },
  ];

  for (const zone of zones) {
    await prisma.geographicZone.upsert({
      where: { zone: zone.zone as any },
      create: {
        zone: zone.zone as any,
        name: zone.name,
        suburbs: zone.suburbs,
        preferredDays: zone.preferredDays,
        travelBufferMinutes: zone.travelBufferMinutes,
        surchargeCents: zone.surchargeCents,
      },
      update: {
        name: zone.name,
        suburbs: zone.suburbs,
        preferredDays: zone.preferredDays,
        travelBufferMinutes: zone.travelBufferMinutes,
        surchargeCents: zone.surchargeCents,
      },
    });
  }

  console.log(`Seeded ${zones.length} geographic zones`);
}

async function seedDefaultSupplier() {
  console.log("Seeding default supplier...");

  await prisma.supplier.upsert({
    where: { id: "default-supplier" },
    create: {
      id: "default-supplier",
      name: "Default Parts Supplier",
      accountNumber: "MAWNZ-001",
      contactName: "Parts Department",
      contactEmail: "parts@supplier.co.nz",
      isActive: true,
    },
    update: {},
  });

  console.log("Seeded default supplier");
}

async function seedSampleParts() {
  console.log("Seeding sample parts...");

  const supplier = await prisma.supplier.findFirst();
  if (!supplier) {
    console.error("No supplier found, skipping parts seed");
    return;
  }

  const parts = [
    {
      sku: "OF-GENERIC",
      name: "Oil Filter (Generic)",
      category: "OIL_FILTER",
      tradePriceCents: 1800,
      markupPercent: 40,
    },
    {
      sku: "DW-GENERIC",
      name: "Drain Washer (Generic)",
      category: "DRAIN_WASHER",
      tradePriceCents: 200,
      markupPercent: 50,
    },
    {
      sku: "AF-GENERIC",
      name: "Air Filter (Generic)",
      category: "AIR_FILTER",
      tradePriceCents: 3200,
      markupPercent: 40,
    },
    {
      sku: "CF-GENERIC",
      name: "Cabin Filter (Generic)",
      category: "CABIN_FILTER",
      tradePriceCents: 2500,
      markupPercent: 40,
    },
    {
      sku: "BP-FRONT-GENERIC",
      name: "Front Brake Pads (Generic Set)",
      category: "BRAKE_PAD_FRONT",
      tradePriceCents: 8500,
      markupPercent: 40,
    },
    {
      sku: "BP-REAR-GENERIC",
      name: "Rear Brake Pads (Generic Set)",
      category: "BRAKE_PAD_REAR",
      tradePriceCents: 7000,
      markupPercent: 40,
    },
    {
      sku: "BAT-GENERIC",
      name: "Vehicle Battery (Standard)",
      category: "BATTERY",
      tradePriceCents: 15000,
      markupPercent: 45,
    },
  ];

  for (const part of parts) {
    await prisma.part.upsert({
      where: {
        supplierId_sku: {
          supplierId: supplier.id,
          sku: part.sku,
        },
      },
      create: {
        sku: part.sku,
        name: part.name,
        category: part.category as any,
        tradePriceCents: part.tradePriceCents,
        markupPercent: part.markupPercent,
        supplierId: supplier.id,
      },
      update: {
        name: part.name,
        tradePriceCents: part.tradePriceCents,
        markupPercent: part.markupPercent,
      },
    });
  }

  console.log(`Seeded ${parts.length} sample parts`);
}

async function main() {
  console.log("Starting database seed...\n");

  try {
    await seedServicePackages();
    await seedGeographicZones();
    await seedDefaultSupplier();
    await seedSampleParts();

    console.log("\n✅ Database seed completed successfully!");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
