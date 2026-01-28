export type VehicleClass = {
  fuel_class: 'PETROL' | 'DIESEL' | 'EV';
  body_class: 'CAR' | 'SUV' | 'UTE' | 'VAN' | 'PERFORMANCE' | 'COMMERCIAL';
  load_class: 'LIGHT' | 'HEAVY';
  power_band: 'LOW' | 'MID' | 'HIGH';
};

/**
 * Intelligent vehicle classification based on NZ MotorWeb technical data.
 * This class directly influences the pricing bands for services.
 */
export function classifyVehicle(mw: any): VehicleClass {
  // Extract values with safe-access as MotorWeb XML structure varies
  const gvm = parseInt(mw.gross_vehicle_mass?.value || mw.gvm || '0');
  const power = parseInt(mw.power?.value || mw.power_kw || '0');
  const fuel = (mw.fuel_type?.description || mw.fuel_type?.value || mw.fuel || '').toUpperCase();
  const body = (mw.body_style?.description || mw.body_style?.value || mw.body_style || '').toUpperCase();

  // Fuel Mapping
  let fuel_class: VehicleClass['fuel_class'] = 'PETROL';
  if (fuel.includes('DIESEL')) fuel_class = 'DIESEL';
  if (fuel.includes('ELECTRIC') || fuel === 'EV') fuel_class = 'EV';

  // Body & Load Mapping
  let body_class: VehicleClass['body_class'] = 'CAR';
  if (body.includes('SUV')) body_class = 'SUV';
  if (body.includes('UTE')) body_class = 'UTE';
  if (body.includes('VAN')) body_class = 'VAN';
  
  // Power & Performance Gating (>200kW is PERFORMANCE)
  let power_band: VehicleClass['power_band'] = 'LOW';
  if (power > 120) power_band = 'MID';
  if (power > 200) {
    power_band = 'HIGH';
    body_class = 'PERFORMANCE';
  }

  // Commercial Gating (Diesel Utes/Vans or >3.5t are COMMERCIAL/HEAVY)
  let load_class: VehicleClass['load_class'] = 'LIGHT';
  const isDieselComm = fuel_class === 'DIESEL' && (body_class === 'UTE' || body_class === 'VAN');
  if (gvm > 3500 || isDieselComm) {
    load_class = 'HEAVY';
    body_class = 'COMMERCIAL';
  }

  return { fuel_class, body_class, load_class, power_band };
}
