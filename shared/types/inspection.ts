/**
 * Inspection Report Types - v1 Schema
 * Used by both server and client for structured pre-purchase inspection reports
 */

export type InspectionStatus = "OK" | "Attention Soon" | "Requires Repair" | "N/A";

export type OverallCondition = "Excellent" | "Good" | "Fair" | "Poor";

export type Recommendation = "Recommend purchase" | "Caution" | "Not recommended";

export interface InspectionPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface InspectionItem {
  key: string;
  label: string;
  status: InspectionStatus;
  comment?: string;
  photos: InspectionPhoto[];
}

export interface InspectionSection {
  key: string;
  title: string;
  items: InspectionItem[];
}

export interface InspectionVehicle {
  make: string;
  model: string;
  year: number;
  rego?: string;
  kms?: number;
  vin?: string;
}

export interface InspectionCustomer {
  name: string;
  email?: string;
  phone?: string;
}

export interface InspectionSummary {
  overallCondition: OverallCondition;
  recommendation: Recommendation;
  overallComment?: string;
}

export interface InspectionReportDataV1 {
  reportType: "pre_purchase" | "service";
  vehicle: InspectionVehicle;
  customer: InspectionCustomer;
  inspectionDate: string;
  sections: InspectionSection[];
  summary: InspectionSummary;
}

/**
 * Default template for a new pre-purchase inspection report
 */
export function createDefaultPrePurchaseReport(
  vehicle: InspectionVehicle,
  customer: InspectionCustomer,
  inspectionDate: string
): InspectionReportDataV1 {
  return {
    reportType: "pre_purchase",
    vehicle,
    customer,
    inspectionDate,
    sections: [
      {
        key: "vehicle_identity",
        title: "Vehicle Identity & Basics",
        items: [
          { key: "vin_chassis", label: "VIN / Chassis number", status: "N/A", photos: [] },
          { key: "odometer", label: "Odometer reading", status: "N/A", photos: [] },
          { key: "registration", label: "Registration validity", status: "N/A", photos: [] },
          { key: "service_history", label: "Service history evidence", status: "N/A", photos: [] },
        ],
      },
      {
        key: "exterior_body",
        title: "Exterior / Body",
        items: [
          { key: "paint_panels", label: "Paint & panels", status: "N/A", photos: [] },
          { key: "rust_corrosion", label: "Rust / corrosion", status: "N/A", photos: [] },
          { key: "glass_mirrors", label: "Glass & mirrors", status: "N/A", photos: [] },
          { key: "doors_locks", label: "Doors / locks", status: "N/A", photos: [] },
          { key: "bumpers_trims", label: "Bumpers & trims", status: "N/A", photos: [] },
        ],
      },
      {
        key: "tyres_wheels",
        title: "Tyres & Wheels",
        items: [
          { key: "tyre_tread", label: "Tyre tread depths", status: "N/A", photos: [] },
          { key: "tyre_condition", label: "Tyre age/condition", status: "N/A", photos: [] },
          { key: "wheels_rims", label: "Wheels / rims", status: "N/A", photos: [] },
          { key: "wheel_alignment", label: "Wheel alignment (road test impression)", status: "N/A", photos: [] },
        ],
      },
      {
        key: "brakes_suspension",
        title: "Brakes & Suspension",
        items: [
          { key: "brake_pads", label: "Brake pads/shoes", status: "N/A", photos: [] },
          { key: "brake_discs", label: "Brake discs/drums", status: "N/A", photos: [] },
          { key: "brake_lines", label: "Brake lines/hoses", status: "N/A", photos: [] },
          { key: "suspension", label: "Suspension (shocks/struts)", status: "N/A", photos: [] },
          { key: "steering", label: "Steering components", status: "N/A", photos: [] },
        ],
      },
      {
        key: "engine_bay",
        title: "Engine Bay",
        items: [
          { key: "engine_oil", label: "Engine oil level & condition", status: "N/A", photos: [] },
          { key: "coolant", label: "Coolant level & condition", status: "N/A", photos: [] },
          { key: "belts_hoses", label: "Belts & hoses", status: "N/A", photos: [] },
          { key: "visible_leaks", label: "Visible leaks (oil/coolant)", status: "N/A", photos: [] },
          { key: "battery", label: "Battery & charging", status: "N/A", photos: [] },
        ],
      },
      {
        key: "underbody",
        title: "Underbody (where accessible)",
        items: [
          { key: "oil_leaks_under", label: "Oil leaks", status: "N/A", photos: [] },
          { key: "exhaust", label: "Exhaust system", status: "N/A", photos: [] },
          { key: "structural", label: "Structural rust/damage", status: "N/A", photos: [] },
        ],
      },
      {
        key: "interior",
        title: "Interior",
        items: [
          { key: "seats_belts", label: "Seats & belts", status: "N/A", photos: [] },
          { key: "dashboard_lights", label: "Dashboard warning lights", status: "N/A", photos: [] },
          { key: "hvac", label: "HVAC (heater/AC)", status: "N/A", photos: [] },
          { key: "windows_switches", label: "Windows & switches", status: "N/A", photos: [] },
        ],
      },
      {
        key: "electrical",
        title: "Electrical & Accessories",
        items: [
          { key: "lights", label: "Lights (front/rear/indicators)", status: "N/A", photos: [] },
          { key: "wipers", label: "Wipers & washers", status: "N/A", photos: [] },
          { key: "horn", label: "Horn", status: "N/A", photos: [] },
          { key: "audio", label: "Audio / infotainment (basic check)", status: "N/A", photos: [] },
        ],
      },
      {
        key: "road_test",
        title: "Road Test",
        items: [
          { key: "engine_performance", label: "Engine performance", status: "N/A", photos: [] },
          { key: "transmission", label: "Transmission / clutch", status: "N/A", photos: [] },
          { key: "steering_feel", label: "Steering feel", status: "N/A", photos: [] },
          { key: "braking_performance", label: "Braking performance", status: "N/A", photos: [] },
          { key: "noises_vibrations", label: "Noises / vibrations", status: "N/A", photos: [] },
        ],
      },
    ],
    summary: {
      overallCondition: "Good",
      recommendation: "Caution",
      overallComment: "",
    },
  };
}
