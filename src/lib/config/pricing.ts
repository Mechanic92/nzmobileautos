export type RevenueEnginePricingConfig = {
  labourRateCentsPerHour: number;
  diagnosticFixedCents: number;
  ppiFixedCents: number;
  ppiUrgencySurchargeCents: number;
  addOns: {
    prioritySameDayCents: number;
    outsideCoreAreaCents: number;
    afterHoursCents: number;
    engineOilFlushCents: number;
    fuelAdditiveCents: number;
  };
  serviceDurationsMinutes: {
    diagnostic: number;
    ppi: number;
    basicService: number;
    comprehensiveService: number;
  };
  serviceBands: {
    oilFilter: {
      petrolSmallCar: number;
      petrolMidCar: number;
      dieselUte: number;
      euroPerformance: number;
    };
    basic: {
      petrolSmallCar: number;
      petrolMidCar: number;
      dieselUte: number;
      euroPerformance: number;
    };
    comprehensive: {
      petrolSmallCar: number;
      petrolMidCar: number;
      dieselUte: number;
      euroPerformance: number;
    };
  };
  oilPricing: {
    defaultIncludedLitres: number;
    includedLitresByVehicleClass: {
      lightCar: number;
      suv: number;
      uteVan: number;
      heavyCommercial: number;
      performance: number;
    };
    extraOilPerLitreCents: number;
  };
  motorWebLookupCostCents: number;
};

function envNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function getRevenueEnginePricingConfig(): RevenueEnginePricingConfig {
  return {
    labourRateCentsPerHour: envNumber("LABOUR_RATE_CENTS_PER_HOUR", 11000),
    diagnosticFixedCents: envNumber("DIAGNOSTIC_FIXED_CENTS", 14000),
    ppiFixedCents: envNumber("PPI_FIXED_CENTS", 18000),
    ppiUrgencySurchargeCents: envNumber("PPI_URGENCY_SURCHARGE_CENTS", 5000),
    addOns: {
      prioritySameDayCents: envNumber("ADDON_PRIORITY_SAME_DAY_CENTS", 5000),
      outsideCoreAreaCents: envNumber("ADDON_OUTSIDE_CORE_AREA_CENTS", 3000),
      afterHoursCents: envNumber("ADDON_AFTER_HOURS_CENTS", 7500),
      engineOilFlushCents: envNumber("ADDON_OIL_FLUSH_CENTS", 4500),
      fuelAdditiveCents: envNumber("ADDON_FUEL_ADDITIVE_CENTS", 3500),
    },
    serviceDurationsMinutes: {
      diagnostic: envNumber("DURATION_DIAGNOSTIC_MINUTES", 60),
      ppi: envNumber("DURATION_PPI_MINUTES", 120),
      basicService: envNumber("DURATION_BASIC_SERVICE_MINUTES", 60),
      comprehensiveService: envNumber("DURATION_COMPREHENSIVE_SERVICE_MINUTES", 90),
    },
    serviceBands: {
      oilFilter: {
        petrolSmallCar: envNumber("SERVICE_OIL_PETROL_SMALL_CENTS", 14900),
        petrolMidCar: envNumber("SERVICE_OIL_PETROL_MID_CENTS", 16900),
        dieselUte: envNumber("SERVICE_OIL_DIESEL_UTE_CENTS", 19900),
        euroPerformance: envNumber("SERVICE_OIL_EURO_PERF_CENTS", 22900),
      },
      basic: {
        petrolSmallCar: envNumber("SERVICE_BASIC_PETROL_SMALL_CENTS", 27500),
        petrolMidCar: envNumber("SERVICE_BASIC_PETROL_MID_CENTS", 29500),
        dieselUte: envNumber("SERVICE_BASIC_DIESEL_UTE_CENTS", 34500),
        euroPerformance: envNumber("SERVICE_BASIC_EURO_PERF_CENTS", 39500),
      },
      comprehensive: {
        petrolSmallCar: envNumber("SERVICE_COMP_PETROL_SMALL_CENTS", 38500),
        petrolMidCar: envNumber("SERVICE_COMP_PETROL_MID_CENTS", 42500),
        dieselUte: envNumber("SERVICE_COMP_DIESEL_UTE_CENTS", 44500),
        euroPerformance: envNumber("SERVICE_COMP_EURO_PERF_CENTS", 49500),
      },
    },
    oilPricing: {
      defaultIncludedLitres: envNumber("OIL_INCLUDED_LITRES_DEFAULT", 5),
      includedLitresByVehicleClass: {
        lightCar: envNumber("OIL_INCLUDED_LITRES_LIGHT_CAR", 5),
        suv: envNumber("OIL_INCLUDED_LITRES_SUV", 5),
        uteVan: envNumber("OIL_INCLUDED_LITRES_UTE_VAN", 8),
        heavyCommercial: envNumber("OIL_INCLUDED_LITRES_HEAVY_COMMERCIAL", 10),
        performance: envNumber("OIL_INCLUDED_LITRES_PERFORMANCE", 6),
      },
      extraOilPerLitreCents: envNumber("OIL_EXTRA_PER_LITRE_CENTS", 2200),
    },
    motorWebLookupCostCents: envNumber("MOTORWEB_LOOKUP_COST_CENTS", 25),
  };
}
