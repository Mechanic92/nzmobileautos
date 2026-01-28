import { VehicleClass } from './classification';

export type ServiceMode = 'SERVICE' | 'REPAIR';

export interface QuoteResult {
  mode: ServiceMode;
  total: number;
  gst: number;
  breakdown: Record<string, any>;
  disclaimer: string;
  isEstimate: boolean;
  estimateRange?: { min: number; max: number };
}

/**
 * Service Pricing Bands (GST Inclusive)
 */
const SERVICE_BANDS = {
  BASIC: {
    PETROL: { CAR: 275, SUV: 295, PERFORMANCE: 345 },
    DIESEL: { UTE: 305, COMMERCIAL: 345 }
  },
  COMPREHENSIVE: {
    PETROL: { CAR: 385, SUV: 405, PERFORMANCE: 465 },
    DIESEL: { UTE: 415, COMMERCIAL: 465 }
  },
  DIAGNOSTICS: 140, // Flat fee
  PPI: 220 // Pre-Purchase Inspection
};

/**
 * Generates controlled pricing or estimates based on vehicle identity and service type.
 */
export function generateQuote(
  mode: ServiceMode, 
  vClass: VehicleClass, 
  serviceKey?: string
): QuoteResult {
  
  // A) SERVICE QUOTE MODE (Fixed or Band-based)
  if (mode === 'SERVICE') {
    let total = 0;
    let description = '';
    
    if (serviceKey === 'DIAGNOSTICS') {
      total = SERVICE_BANDS.DIAGNOSTICS;
      description = 'Standard Mobile Diagnostics';
    } else if (serviceKey === 'PPI') {
      total = SERVICE_BANDS.PPI;
      description = 'Pre-Purchase Inspection';
    } else {
      // Band-based lookups
      const type = serviceKey === 'COMPREHENSIVE' ? 'COMPREHENSIVE' : 'BASIC';
      const fuel = vClass.fuel_class === 'EV' ? 'PETROL' : vClass.fuel_class; // EVs treated as high-tech petrol for base
      
      // Fallback for missing mapping
      const category: any = PRICING_TABLE_LOOKUP(type, fuel, vClass.body_class);
      total = category;
      description = `${type} Service for ${vClass.body_class}`;
    }

    return {
      mode: 'SERVICE',
      total,
      gst: total * 0.130435, // 15% GST embedded
      breakdown: {
        base_price: total,
        oil_included: 'Up to 5L included',
      },
      disclaimer: "Final oil quantity and requirements confirmed onsite. Extra oil charged at $22/L.",
      isEstimate: false
    };
  }

  // B) REPAIR ESTIMATE MODE (Ranges only)
  // Maps to dynamic min/max based on vehicle heavy/light class
  const isHeavy = vClass.load_class === 'HEAVY';
  const range = isHeavy ? { min: 450, max: 750 } : { min: 250, max: 550 };

  return {
    mode: 'REPAIR',
    total: range.min, // For display ordering/logic
    gst: range.min * 0.130435,
    estimateRange: range,
    breakdown: {},
    disclaimer: "Pricing shown is an estimated range for a standard repair. Final cost depends on parts and complexity, confirmed after diagnostic inspection.",
    isEstimate: true
  };
}

function PRICING_TABLE_LOOKUP(type: 'BASIC' | 'COMPREHENSIVE', fuel: string, body: string): number {
  const table: any = SERVICE_BANDS[type];
  const fuelBand = table[fuel] || table['PETROL'];
  return fuelBand[body] || fuelBand['CAR'] || 295;
}
