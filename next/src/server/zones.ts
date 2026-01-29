/**
 * Geographic Zone Management
 * Handles Auckland zone definitions, suburb mapping, and scheduling preferences
 */

import { prisma } from "./prisma";

export type AucklandZoneType = 
  | "NORTH_SHORE"
  | "WEST_AUCKLAND"
  | "CENTRAL"
  | "EAST_AUCKLAND"
  | "SOUTH_AUCKLAND";

// Default zone configurations
export const ZONE_CONFIGS: Record<AucklandZoneType, {
  name: string;
  suburbs: string[];
  preferredDays: string[];
  travelBufferMinutes: number;
  surchargeCents: number;
}> = {
  NORTH_SHORE: {
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
  WEST_AUCKLAND: {
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
  CENTRAL: {
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
  EAST_AUCKLAND: {
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
    surchargeCents: 3000, // $30 surcharge
  },
  SOUTH_AUCKLAND: {
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
    surchargeCents: 3000, // $30 surcharge
  },
};

/**
 * Determine which zone a suburb belongs to
 */
export function getZoneForSuburb(suburb: string): AucklandZoneType | null {
  const normalizedSuburb = suburb.toLowerCase().trim();
  
  for (const [zone, config] of Object.entries(ZONE_CONFIGS)) {
    const found = config.suburbs.some(
      s => s.toLowerCase() === normalizedSuburb
    );
    if (found) {
      return zone as AucklandZoneType;
    }
  }
  
  return null;
}

/**
 * Get zone configuration
 */
export function getZoneConfig(zone: AucklandZoneType) {
  return ZONE_CONFIGS[zone];
}

/**
 * Check if a suburb is in the service area
 */
export function isInServiceArea(suburb: string): boolean {
  return getZoneForSuburb(suburb) !== null;
}

/**
 * Get surcharge for a suburb
 */
export function getSuburbSurcharge(suburb: string): number {
  const zone = getZoneForSuburb(suburb);
  if (!zone) return 5000; // $50 for out-of-area
  return ZONE_CONFIGS[zone].surchargeCents;
}

/**
 * Get preferred days for a zone
 */
export function getPreferredDays(zone: AucklandZoneType): string[] {
  return ZONE_CONFIGS[zone].preferredDays;
}

/**
 * Seed zone data into database
 */
export async function seedZones(): Promise<void> {
  for (const [zoneCode, config] of Object.entries(ZONE_CONFIGS)) {
    await prisma.geographicZone.upsert({
      where: { name: config.name },
      create: {
        name: config.name,
        suburbs: config.suburbs,
        preferredDays: config.preferredDays,
      },
      update: {
        suburbs: config.suburbs,
        preferredDays: config.preferredDays,
      },
    });
  }
  console.log("[Zones] Seeded geographic zones");
}

/**
 * Get all zones with their configurations
 */
export async function getAllZones() {
  const zones = await prisma.geographicZone.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  
  return zones;
}
