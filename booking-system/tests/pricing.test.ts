/**
 * Pricing Engine Tests
 */

import { describe, it, expect } from "vitest";
import {
  calculatePrice,
  getEngineSize,
  normalizeFuelType,
  getBasePrice,
  calculateOilSurcharge,
} from "../src/services/pricing";

describe("Engine Size Classification", () => {
  it("classifies small engines (<2000cc)", () => {
    expect(getEngineSize(1500)).toBe("SMALL");
    expect(getEngineSize(1999)).toBe("SMALL");
    expect(getEngineSize(2000)).toBe("SMALL");
  });

  it("classifies medium engines (2000-3000cc)", () => {
    expect(getEngineSize(2001)).toBe("MEDIUM");
    expect(getEngineSize(2500)).toBe("MEDIUM");
    expect(getEngineSize(3000)).toBe("MEDIUM");
  });

  it("classifies large engines (>3000cc)", () => {
    expect(getEngineSize(3001)).toBe("LARGE");
    expect(getEngineSize(5000)).toBe("LARGE");
  });
});

describe("Fuel Type Normalization", () => {
  it("normalizes petrol variants", () => {
    expect(normalizeFuelType("PETROL")).toBe("PETROL");
    expect(normalizeFuelType("Gasoline")).toBe("PETROL");
    expect(normalizeFuelType("unleaded")).toBe("PETROL");
  });

  it("normalizes diesel variants", () => {
    expect(normalizeFuelType("DIESEL")).toBe("DIESEL");
    expect(normalizeFuelType("Turbo Diesel")).toBe("DIESEL");
  });

  it("defaults unknown to petrol", () => {
    expect(normalizeFuelType("unknown")).toBe("PETROL");
  });
});

describe("Base Price Lookup", () => {
  it("returns correct basic service prices for petrol", () => {
    expect(getBasePrice("BASIC", "PETROL", "SMALL")).toBe(27500);
    expect(getBasePrice("BASIC", "PETROL", "MEDIUM")).toBe(29500);
    expect(getBasePrice("BASIC", "PETROL", "LARGE")).toBe(32500);
  });

  it("returns correct basic service prices for diesel", () => {
    expect(getBasePrice("BASIC", "DIESEL", "SMALL")).toBe(30500);
    expect(getBasePrice("BASIC", "DIESEL", "MEDIUM")).toBe(31500);
    expect(getBasePrice("BASIC", "DIESEL", "LARGE")).toBe(34500);
  });

  it("returns correct comprehensive service prices", () => {
    expect(getBasePrice("COMPREHENSIVE", "PETROL", "SMALL")).toBe(38500);
    expect(getBasePrice("COMPREHENSIVE", "DIESEL", "LARGE")).toBe(46500);
  });
});

describe("Oil Surcharge Calculation", () => {
  it("returns 0 for 5L or less", () => {
    expect(calculateOilSurcharge(5)).toBe(0);
    expect(calculateOilSurcharge(4)).toBe(0);
    expect(calculateOilSurcharge(undefined)).toBe(0);
  });

  it("charges $22 per extra litre", () => {
    expect(calculateOilSurcharge(6)).toBe(2200);
    expect(calculateOilSurcharge(7)).toBe(4400);
    expect(calculateOilSurcharge(10)).toBe(11000);
  });
});

describe("Full Price Calculation", () => {
  const testVehicle = {
    plate: "ABC123",
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    fuel: "PETROL",
    cc: 1800,
    vin: "",
    body: "",
  };

  it("calculates basic service for small petrol", () => {
    const result = calculatePrice({
      vehicle: testVehicle,
      serviceType: "BASIC",
    });

    expect(result.success).toBe(true);
    expect(result.breakdown?.basePriceCents).toBe(27500);
    expect(result.breakdown?.totalIncGstCents).toBe(27500);
  });

  it("calculates comprehensive service for small petrol", () => {
    const result = calculatePrice({
      vehicle: testVehicle,
      serviceType: "COMPREHENSIVE",
    });

    expect(result.success).toBe(true);
    expect(result.breakdown?.basePriceCents).toBe(38500);
  });

  it("adds extras correctly", () => {
    const result = calculatePrice({
      vehicle: testVehicle,
      serviceType: "BASIC",
      extras: ["ENGINE_FLUSH", "AIR_FRAGRANCE"],
    });

    expect(result.success).toBe(true);
    expect(result.breakdown?.extrasCents).toBe(6900); // 4900 + 2000
    expect(result.breakdown?.totalIncGstCents).toBe(34400); // 27500 + 6900
  });

  it("adds oil surcharge correctly", () => {
    const result = calculatePrice({
      vehicle: testVehicle,
      serviceType: "BASIC",
      oilCapacityLitres: 7,
    });

    expect(result.success).toBe(true);
    expect(result.breakdown?.oilSurchargeCents).toBe(4400);
    expect(result.breakdown?.totalIncGstCents).toBe(31900);
  });

  it("rejects electric vehicles", () => {
    const result = calculatePrice({
      vehicle: { ...testVehicle, fuel: "ELECTRIC" },
      serviceType: "BASIC",
    });

    expect(result.success).toBe(false);
    expect(result.requiresApproval).toBe(true);
  });

  it("rejects hybrid vehicles", () => {
    const result = calculatePrice({
      vehicle: { ...testVehicle, fuel: "HYBRID" },
      serviceType: "BASIC",
    });

    expect(result.success).toBe(false);
    expect(result.requiresApproval).toBe(true);
  });

  it("rejects vehicles with unknown engine size", () => {
    const result = calculatePrice({
      vehicle: { ...testVehicle, cc: 0 },
      serviceType: "BASIC",
    });

    expect(result.success).toBe(false);
    expect(result.requiresApproval).toBe(true);
  });
});

describe("Diesel Pricing", () => {
  const dieselVehicle = {
    plate: "DEF456",
    make: "Ford",
    model: "Ranger",
    year: 2021,
    fuel: "DIESEL",
    cc: 3200,
    vin: "",
    body: "",
  };

  it("calculates basic service for large diesel", () => {
    const result = calculatePrice({
      vehicle: dieselVehicle,
      serviceType: "BASIC",
    });

    expect(result.success).toBe(true);
    expect(result.breakdown?.basePriceCents).toBe(34500);
    expect(result.breakdown?.vehicle.fuel).toBe("DIESEL");
    expect(result.breakdown?.vehicle.engineSize).toBe("LARGE");
  });

  it("calculates comprehensive service for large diesel", () => {
    const result = calculatePrice({
      vehicle: dieselVehicle,
      serviceType: "COMPREHENSIVE",
    });

    expect(result.success).toBe(true);
    expect(result.breakdown?.basePriceCents).toBe(46500);
  });
});
