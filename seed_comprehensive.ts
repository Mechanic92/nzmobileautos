import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 COMPREHENSIVE NZ VEHICLE DATABASE SEEDING\n');
  console.log('='.repeat(70));

  // Comprehensive NZ vehicle fleet - no API calls needed
  const vehicles = [
    // TOYOTA - Most popular brand in NZ
    { plate: 'ABC123', make: 'Toyota', model: 'Corolla', year: 2018, fuel: 'Petrol', power_kw: 103, body_style: 'Sedan', gvm: 1500, vin: 'JTDBR32E300000001' },
    { plate: 'ABC124', make: 'Toyota', model: 'Corolla', year: 2020, fuel: 'Petrol', power_kw: 103, body_style: 'Sedan', gvm: 1500, vin: 'JTDBR32E300000002' },
    { plate: 'ABC125', make: 'Toyota', model: 'Corolla Hybrid', year: 2021, fuel: 'Petrol', power_kw: 90, body_style: 'Sedan', gvm: 1520, vin: 'JTDBR32E300000003' },
    { plate: 'XYZ789', make: 'Toyota', model: 'RAV4', year: 2020, fuel: 'Petrol', power_kw: 127, body_style: 'SUV', gvm: 2080, vin: 'JTMRFREV5KD000001' },
    { plate: 'XYZ790', make: 'Toyota', model: 'RAV4', year: 2019, fuel: 'Petrol', power_kw: 127, body_style: 'SUV', gvm: 2080, vin: 'JTMRFREV5KD000002' },
    { plate: 'XYZ791', make: 'Toyota', model: 'RAV4 Hybrid', year: 2021, fuel: 'Petrol', power_kw: 163, body_style: 'SUV', gvm: 2150, vin: 'JTMRFREV5KD000003' },
    { plate: 'DEF456', make: 'Toyota', model: 'Hilux', year: 2019, fuel: 'Diesel', power_kw: 130, body_style: 'Utility', gvm: 3090, vin: 'MR0FZ22G000000001' },
    { plate: 'DEF457', make: 'Toyota', model: 'Hilux', year: 2020, fuel: 'Diesel', power_kw: 150, body_style: 'Utility', gvm: 3090, vin: 'MR0FZ22G000000002' },
    { plate: 'DEF458', make: 'Toyota', model: 'Hilux', year: 2021, fuel: 'Diesel', power_kw: 150, body_style: 'Utility', gvm: 3090, vin: 'MR0FZ22G000000003' },
    { plate: 'DEF459', make: 'Toyota', model: 'Hilux SR5', year: 2022, fuel: 'Diesel', power_kw: 150, body_style: 'Utility', gvm: 3090, vin: 'MR0FZ22G000000004' },
    { plate: 'TOY001', make: 'Toyota', model: 'Camry', year: 2019, fuel: 'Petrol', power_kw: 131, body_style: 'Sedan', gvm: 1920, vin: 'JTDBT32E300000001' },
    { plate: 'TOY002', make: 'Toyota', model: 'Camry Hybrid', year: 2020, fuel: 'Petrol', power_kw: 160, body_style: 'Sedan', gvm: 1970, vin: 'JTDBT32E300000002' },
    { plate: 'TOY003', make: 'Toyota', model: 'Highlander', year: 2020, fuel: 'Petrol', power_kw: 218, body_style: 'SUV', gvm: 2690, vin: 'JTMRFREV5KD000004' },
    { plate: 'TOY004', make: 'Toyota', model: 'C-HR', year: 2018, fuel: 'Petrol', power_kw: 85, body_style: 'SUV', gvm: 1795, vin: 'JTMRFREV5KD000005' },
    { plate: 'TOY005', make: 'Toyota', model: 'Yaris', year: 2019, fuel: 'Petrol', power_kw: 73, body_style: 'Hatchback', gvm: 1305, vin: 'JTDBR32E300000005' },
    { plate: 'TOY006', make: 'Toyota', model: 'Prius', year: 2018, fuel: 'Petrol', power_kw: 90, body_style: 'Hatchback', gvm: 1620, vin: 'JTDBR32E300000006' },
    { plate: 'TOY007', make: 'Toyota', model: 'Land Cruiser', year: 2019, fuel: 'Diesel', power_kw: 171, body_style: 'SUV', gvm: 3300, vin: 'JTMRFREV5KD000006' },
    { plate: 'TOY008', make: 'Toyota', model: 'Prado', year: 2020, fuel: 'Diesel', power_kw: 130, body_style: 'SUV', gvm: 3000, vin: 'JTMRFREV5KD000007' },
    
    // MAZDA - Second most popular
    { plate: 'GHI789', make: 'Mazda', model: 'Demio', year: 2015, fuel: 'Petrol', power_kw: 75, body_style: 'Hatchback', gvm: 1380, vin: 'JMZDE14A000000001' },
    { plate: 'GHI790', make: 'Mazda', model: 'Demio', year: 2016, fuel: 'Petrol', power_kw: 75, body_style: 'Hatchback', gvm: 1380, vin: 'JMZDE14A000000002' },
    { plate: 'JKL012', make: 'Mazda', model: 'CX-5', year: 2021, fuel: 'Petrol', power_kw: 140, body_style: 'SUV', gvm: 2000, vin: 'JM3KFBDM0M0000001' },
    { plate: 'JKL013', make: 'Mazda', model: 'CX-5', year: 2020, fuel: 'Petrol', power_kw: 140, body_style: 'SUV', gvm: 2000, vin: 'JM3KFBDM0M0000002' },
    { plate: 'JKL014', make: 'Mazda', model: 'CX-5', year: 2019, fuel: 'Diesel', power_kw: 140, body_style: 'SUV', gvm: 2100, vin: 'JM3KFBDM0M0000003' },
    { plate: 'MNO345', make: 'Mazda', model: 'BT-50', year: 2020, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3200, vin: 'MM0UY28G000000001' },
    { plate: 'MNO346', make: 'Mazda', model: 'BT-50', year: 2021, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3200, vin: 'MM0UY28G000000002' },
    { plate: 'MAZ001', make: 'Mazda', model: 'Mazda3', year: 2019, fuel: 'Petrol', power_kw: 89, body_style: 'Hatchback', gvm: 1650, vin: 'JMZDE14A000000003' },
    { plate: 'MAZ002', make: 'Mazda', model: 'Mazda3', year: 2020, fuel: 'Petrol', power_kw: 114, body_style: 'Hatchback', gvm: 1650, vin: 'JMZDE14A000000004' },
    { plate: 'MAZ003', make: 'Mazda', model: 'Mazda6', year: 2018, fuel: 'Petrol', power_kw: 140, body_style: 'Sedan', gvm: 1950, vin: 'JMZDE14A000000005' },
    { plate: 'MAZ004', make: 'Mazda', model: 'CX-3', year: 2019, fuel: 'Petrol', power_kw: 109, body_style: 'SUV', gvm: 1750, vin: 'JM3KFBDM0M0000004' },
    { plate: 'MAZ005', make: 'Mazda', model: 'CX-9', year: 2020, fuel: 'Petrol', power_kw: 170, body_style: 'SUV', gvm: 2700, vin: 'JM3KFBDM0M0000005' },
    { plate: 'MAZ006', make: 'Mazda', model: 'MX-5', year: 2019, fuel: 'Petrol', power_kw: 118, body_style: 'Convertible', gvm: 1340, vin: 'JMZDE14A000000006' },
    
    // HONDA
    { plate: 'PQR678', make: 'Honda', model: 'Fit', year: 2017, fuel: 'Petrol', power_kw: 97, body_style: 'Hatchback', gvm: 1420, vin: 'JHMGK5H50HC000001' },
    { plate: 'PQR679', make: 'Honda', model: 'Fit Hybrid', year: 2018, fuel: 'Petrol', power_kw: 81, body_style: 'Hatchback', gvm: 1430, vin: 'JHMGK5H50HC000002' },
    { plate: 'STU901', make: 'Honda', model: 'CR-V', year: 2019, fuel: 'Petrol', power_kw: 140, body_style: 'SUV', gvm: 2015, vin: 'JHLRW2H80KC000001' },
    { plate: 'STU902', make: 'Honda', model: 'CR-V', year: 2020, fuel: 'Petrol', power_kw: 140, body_style: 'SUV', gvm: 2015, vin: 'JHLRW2H80KC000002' },
    { plate: 'HON001', make: 'Honda', model: 'Civic', year: 2019, fuel: 'Petrol', power_kw: 127, body_style: 'Sedan', gvm: 1625, vin: 'JHMGK5H50HC000003' },
    { plate: 'HON002', make: 'Honda', model: 'Civic Type R', year: 2020, fuel: 'Petrol', power_kw: 228, body_style: 'Hatchback', gvm: 1735, vin: 'JHMGK5H50HC000004' },
    { plate: 'HON003', make: 'Honda', model: 'HR-V', year: 2018, fuel: 'Petrol', power_kw: 96, body_style: 'SUV', gvm: 1605, vin: 'JHLRW2H80KC000003' },
    { plate: 'HON004', make: 'Honda', model: 'Accord', year: 2019, fuel: 'Petrol', power_kw: 143, body_style: 'Sedan', gvm: 1915, vin: 'JHMGK5H50HC000005' },
    
    // NISSAN
    { plate: 'VWX234', make: 'Nissan', model: 'Leaf', year: 2018, fuel: 'Electric', power_kw: 110, body_style: 'Hatchback', gvm: 1940, vin: 'SJKCA0E51J0000001' },
    { plate: 'VWX235', make: 'Nissan', model: 'Leaf', year: 2019, fuel: 'Electric', power_kw: 110, body_style: 'Hatchback', gvm: 1940, vin: 'SJKCA0E51J0000002' },
    { plate: 'VWX236', make: 'Nissan', model: 'Leaf e+', year: 2020, fuel: 'Electric', power_kw: 160, body_style: 'Hatchback', gvm: 2010, vin: 'SJKCA0E51J0000003' },
    { plate: 'YZA567', make: 'Nissan', model: 'Navara', year: 2019, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3130, vin: 'JN1TANT32U0000001' },
    { plate: 'YZA568', make: 'Nissan', model: 'Navara', year: 2020, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3130, vin: 'JN1TANT32U0000002' },
    { plate: 'YZA569', make: 'Nissan', model: 'Navara ST-X', year: 2021, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3130, vin: 'JN1TANT32U0000003' },
    { plate: 'BCD890', make: 'Nissan', model: 'X-Trail', year: 2020, fuel: 'Petrol', power_kw: 126, body_style: 'SUV', gvm: 2135, vin: 'JN1BANT32U0000001' },
    { plate: 'BCD891', make: 'Nissan', model: 'X-Trail', year: 2019, fuel: 'Petrol', power_kw: 126, body_style: 'SUV', gvm: 2135, vin: 'JN1BANT32U0000002' },
    { plate: 'NIS001', make: 'Nissan', model: 'Qashqai', year: 2019, fuel: 'Petrol', power_kw: 106, body_style: 'SUV', gvm: 1895, vin: 'JN1BANT32U0000003' },
    { plate: 'NIS002', make: 'Nissan', model: 'Patrol', year: 2018, fuel: 'Diesel', power_kw: 140, body_style: 'SUV', gvm: 3500, vin: 'JN1BANT32U0000004' },
    { plate: 'NIS003', make: 'Nissan', model: 'Juke', year: 2017, fuel: 'Petrol', power_kw: 86, body_style: 'SUV', gvm: 1635, vin: 'JN1BANT32U0000005' },
    { plate: 'NIS004', make: 'Nissan', model: 'Note', year: 2018, fuel: 'Petrol', power_kw: 72, body_style: 'Hatchback', gvm: 1430, vin: 'JN1BANT32U0000006' },
    
    // FORD
    { plate: 'EFG123', make: 'Ford', model: 'Ranger', year: 2021, fuel: 'Diesel', power_kw: 157, body_style: 'Utility', gvm: 3200, vin: 'WFOEXXGBFEKF00001' },
    { plate: 'EFG124', make: 'Ford', model: 'Ranger', year: 2020, fuel: 'Diesel', power_kw: 157, body_style: 'Utility', gvm: 3200, vin: 'WFOEXXGBFEKF00002' },
    { plate: 'EFG125', make: 'Ford', model: 'Ranger Wildtrak', year: 2021, fuel: 'Diesel', power_kw: 157, body_style: 'Utility', gvm: 3200, vin: 'WFOEXXGBFEKF00003' },
    { plate: 'EFG126', make: 'Ford', model: 'Ranger Raptor', year: 2020, fuel: 'Diesel', power_kw: 157, body_style: 'Utility', gvm: 3200, vin: 'WFOEXXGBFEKF00004' },
    { plate: 'HIJ456', make: 'Ford', model: 'Focus', year: 2016, fuel: 'Petrol', power_kw: 92, body_style: 'Hatchback', gvm: 1750, vin: 'WF0SXXGBFS6F00001' },
    { plate: 'HIJ457', make: 'Ford', model: 'Focus', year: 2017, fuel: 'Petrol', power_kw: 92, body_style: 'Hatchback', gvm: 1750, vin: 'WF0SXXGBFS6F00002' },
    { plate: 'FOR001', make: 'Ford', model: 'Escape', year: 2019, fuel: 'Petrol', power_kw: 134, body_style: 'SUV', gvm: 2240, vin: 'WFOEXXGBFEKF00005' },
    { plate: 'FOR002', make: 'Ford', model: 'Everest', year: 2020, fuel: 'Diesel', power_kw: 157, body_style: 'SUV', gvm: 3200, vin: 'WFOEXXGBFEKF00006' },
    { plate: 'FOR003', make: 'Ford', model: 'Mustang', year: 2019, fuel: 'Petrol', power_kw: 310, body_style: 'Coupe', gvm: 2100, vin: 'WFOEXXGBFEKF00007' },
    { plate: 'FOR004', make: 'Ford', model: 'Fiesta', year: 2017, fuel: 'Petrol', power_kw: 74, body_style: 'Hatchback', gvm: 1480, vin: 'WF0SXXGBFS6F00003' },
    
    // HOLDEN
    { plate: 'KLM789', make: 'Holden', model: 'Colorado', year: 2018, fuel: 'Diesel', power_kw: 147, body_style: 'Utility', gvm: 3050, vin: '6G5TD69E0H0000001' },
    { plate: 'KLM790', make: 'Holden', model: 'Colorado', year: 2019, fuel: 'Diesel', power_kw: 147, body_style: 'Utility', gvm: 3050, vin: '6G5TD69E0H0000002' },
    { plate: 'HOL001', make: 'Holden', model: 'Commodore', year: 2017, fuel: 'Petrol', power_kw: 235, body_style: 'Sedan', gvm: 2240, vin: '6G5TD69E0H0000003' },
    { plate: 'HOL002', make: 'Holden', model: 'Trailblazer', year: 2018, fuel: 'Diesel', power_kw: 147, body_style: 'SUV', gvm: 3000, vin: '6G5TD69E0H0000004' },
    { plate: 'HOL003', make: 'Holden', model: 'Captiva', year: 2016, fuel: 'Diesel', power_kw: 135, body_style: 'SUV', gvm: 2600, vin: '6G5TD69E0H0000005' },
    
    // MITSUBISHI
    { plate: 'NOP012', make: 'Mitsubishi', model: 'Outlander', year: 2019, fuel: 'Petrol', power_kw: 124, body_style: 'SUV', gvm: 2240, vin: 'JA4J3VA89KZ000001' },
    { plate: 'NOP013', make: 'Mitsubishi', model: 'Outlander PHEV', year: 2020, fuel: 'Petrol', power_kw: 99, body_style: 'SUV', gvm: 2400, vin: 'JA4J3VA89KZ000002' },
    { plate: 'QRS345', make: 'Mitsubishi', model: 'Triton', year: 2020, fuel: 'Diesel', power_kw: 133, body_style: 'Utility', gvm: 3100, vin: 'MMBJNKB40KH000001' },
    { plate: 'QRS346', make: 'Mitsubishi', model: 'Triton', year: 2021, fuel: 'Diesel', power_kw: 133, body_style: 'Utility', gvm: 3100, vin: 'MMBJNKB40KH000002' },
    { plate: 'MIT001', make: 'Mitsubishi', model: 'ASX', year: 2019, fuel: 'Petrol', power_kw: 110, body_style: 'SUV', gvm: 1810, vin: 'JA4J3VA89KZ000003' },
    { plate: 'MIT002', make: 'Mitsubishi', model: 'Eclipse Cross', year: 2020, fuel: 'Petrol', power_kw: 110, body_style: 'SUV', gvm: 2100, vin: 'JA4J3VA89KZ000004' },
    { plate: 'MIT003', make: 'Mitsubishi', model: 'Pajero', year: 2018, fuel: 'Diesel', power_kw: 133, body_style: 'SUV', gvm: 3000, vin: 'JA4J3VA89KZ000005' },
    
    // HYUNDAI
    { plate: 'TUV678', make: 'Hyundai', model: 'i30', year: 2018, fuel: 'Petrol', power_kw: 99, body_style: 'Hatchback', gvm: 1665, vin: 'KMHD35LE4JU000001' },
    { plate: 'TUV679', make: 'Hyundai', model: 'i30', year: 2019, fuel: 'Petrol', power_kw: 99, body_style: 'Hatchback', gvm: 1665, vin: 'KMHD35LE4JU000002' },
    { plate: 'TUV680', make: 'Hyundai', model: 'i30 N', year: 2020, fuel: 'Petrol', power_kw: 202, body_style: 'Hatchback', gvm: 1735, vin: 'KMHD35LE4JU000003' },
    { plate: 'WXY901', make: 'Hyundai', model: 'Tucson', year: 2021, fuel: 'Petrol', power_kw: 130, body_style: 'SUV', gvm: 2045, vin: 'KMHJ381CBMU000001' },
    { plate: 'WXY902', make: 'Hyundai', model: 'Tucson', year: 2020, fuel: 'Diesel', power_kw: 136, body_style: 'SUV', gvm: 2150, vin: 'KMHJ381CBMU000002' },
    { plate: 'HYU001', make: 'Hyundai', model: 'Kona', year: 2019, fuel: 'Petrol', power_kw: 110, body_style: 'SUV', gvm: 1760, vin: 'KMHD35LE4JU000004' },
    { plate: 'HYU002', make: 'Hyundai', model: 'Kona Electric', year: 2020, fuel: 'Electric', power_kw: 150, body_style: 'SUV', gvm: 2080, vin: 'KMHD35LE4JU000005' },
    { plate: 'HYU003', make: 'Hyundai', model: 'Santa Fe', year: 2020, fuel: 'Diesel', power_kw: 147, body_style: 'SUV', gvm: 2700, vin: 'KMHJ381CBMU000003' },
    { plate: 'HYU004', make: 'Hyundai', model: 'Ioniq', year: 2019, fuel: 'Petrol', power_kw: 77, body_style: 'Hatchback', gvm: 1595, vin: 'KMHD35LE4JU000006' },
    { plate: 'HYU005', make: 'Hyundai', model: 'Accent', year: 2017, fuel: 'Petrol', power_kw: 74, body_style: 'Sedan', gvm: 1485, vin: 'KMHD35LE4JU000007' },
    
    // KIA
    { plate: 'ZAB234', make: 'Kia', model: 'Sportage', year: 2020, fuel: 'Petrol', power_kw: 135, body_style: 'SUV', gvm: 2205, vin: 'KNDPM3AC8L7000001' },
    { plate: 'ZAB235', make: 'Kia', model: 'Sportage', year: 2019, fuel: 'Diesel', power_kw: 136, body_style: 'SUV', gvm: 2300, vin: 'KNDPM3AC8L7000002' },
    { plate: 'KIA001', make: 'Kia', model: 'Sorento', year: 2020, fuel: 'Diesel', power_kw: 147, body_style: 'SUV', gvm: 2700, vin: 'KNDPM3AC8L7000003' },
    { plate: 'KIA002', make: 'Kia', model: 'Carnival', year: 2019, fuel: 'Diesel', power_kw: 147, body_style: 'Van', gvm: 2800, vin: 'KNDPM3AC8L7000004' },
    { plate: 'KIA003', make: 'Kia', model: 'Cerato', year: 2018, fuel: 'Petrol', power_kw: 110, body_style: 'Sedan', gvm: 1640, vin: 'KNDPM3AC8L7000005' },
    { plate: 'KIA004', make: 'Kia', model: 'Seltos', year: 2020, fuel: 'Petrol', power_kw: 110, body_style: 'SUV', gvm: 1870, vin: 'KNDPM3AC8L7000006' },
    { plate: 'KIA005', make: 'Kia', model: 'Stinger', year: 2019, fuel: 'Petrol', power_kw: 272, body_style: 'Sedan', gvm: 2240, vin: 'KNDPM3AC8L7000007' },
    { plate: 'KIA006', make: 'Kia', model: 'Picanto', year: 2018, fuel: 'Petrol', power_kw: 62, body_style: 'Hatchback', gvm: 1305, vin: 'KNDPM3AC8L7000008' },
    
    // SUBARU
    { plate: 'CDE567', make: 'Subaru', model: 'Outback', year: 2019, fuel: 'Petrol', power_kw: 129, body_style: 'SUV', gvm: 2270, vin: '4S4BSANC5K3000001' },
    { plate: 'CDE568', make: 'Subaru', model: 'Outback', year: 2020, fuel: 'Petrol', power_kw: 138, body_style: 'SUV', gvm: 2270, vin: '4S4BSANC5K3000002' },
    { plate: 'FGH890', make: 'Subaru', model: 'Forester', year: 2020, fuel: 'Petrol', power_kw: 136, body_style: 'SUV', gvm: 2270, vin: 'JF2SKADC6LH000001' },
    { plate: 'FGH891', make: 'Subaru', model: 'Forester', year: 2019, fuel: 'Petrol', power_kw: 136, body_style: 'SUV', gvm: 2270, vin: 'JF2SKADC6LH000002' },
    { plate: 'SUB001', make: 'Subaru', model: 'XV', year: 2019, fuel: 'Petrol', power_kw: 113, body_style: 'SUV', gvm: 1915, vin: '4S4BSANC5K3000003' },
    { plate: 'SUB002', make: 'Subaru', model: 'Impreza', year: 2018, fuel: 'Petrol', power_kw: 113, body_style: 'Hatchback', gvm: 1695, vin: '4S4BSANC5K3000004' },
    { plate: 'SUB003', make: 'Subaru', model: 'WRX', year: 2019, fuel: 'Petrol', power_kw: 197, body_style: 'Sedan', gvm: 1870, vin: '4S4BSANC5K3000005' },
    { plate: 'SUB004', make: 'Subaru', model: 'Levorg', year: 2018, fuel: 'Petrol', power_kw: 125, body_style: 'Wagon', gvm: 1870, vin: '4S4BSANC5K3000006' },
    
    // VOLKSWAGEN
    { plate: 'IJK123', make: 'Volkswagen', model: 'Golf', year: 2017, fuel: 'Petrol', power_kw: 92, body_style: 'Hatchback', gvm: 1890, vin: 'WVWZZZAUZJW000001' },
    { plate: 'IJK124', make: 'Volkswagen', model: 'Golf', year: 2018, fuel: 'Petrol', power_kw: 110, body_style: 'Hatchback', gvm: 1890, vin: 'WVWZZZAUZJW000002' },
    { plate: 'IJK125', make: 'Volkswagen', model: 'Golf GTI', year: 2019, fuel: 'Petrol', power_kw: 180, body_style: 'Hatchback', gvm: 1985, vin: 'WVWZZZAUZJW000003' },
    { plate: 'LMN456', make: 'Volkswagen', model: 'Amarok', year: 2019, fuel: 'Diesel', power_kw: 132, body_style: 'Utility', gvm: 3040, vin: 'WV1ZZZ2HZKP000001' },
    { plate: 'LMN457', make: 'Volkswagen', model: 'Amarok', year: 2020, fuel: 'Diesel', power_kw: 165, body_style: 'Utility', gvm: 3040, vin: 'WV1ZZZ2HZKP000002' },
    { plate: 'VW001', make: 'Volkswagen', model: 'Tiguan', year: 2019, fuel: 'Petrol', power_kw: 110, body_style: 'SUV', gvm: 2240, vin: 'WVWZZZAUZJW000004' },
    { plate: 'VW002', make: 'Volkswagen', model: 'Polo', year: 2018, fuel: 'Petrol', power_kw: 70, body_style: 'Hatchback', gvm: 1520, vin: 'WVWZZZAUZJW000005' },
    { plate: 'VW003', make: 'Volkswagen', model: 'Passat', year: 2017, fuel: 'Diesel', power_kw: 140, body_style: 'Sedan', gvm: 2200, vin: 'WVWZZZAUZJW000006' },
    { plate: 'VW004', make: 'Volkswagen', model: 'Touareg', year: 2019, fuel: 'Diesel', power_kw: 170, body_style: 'SUV', gvm: 3200, vin: 'WVWZZZAUZJW000007' },
    
    // SUZUKI
    { plate: 'OPQ789', make: 'Suzuki', model: 'Swift', year: 2018, fuel: 'Petrol', power_kw: 66, body_style: 'Hatchback', gvm: 1235, vin: 'JSAAZC83S00000001' },
    { plate: 'OPQ790', make: 'Suzuki', model: 'Swift Sport', year: 2019, fuel: 'Petrol', power_kw: 103, body_style: 'Hatchback', gvm: 1305, vin: 'JSAAZC83S00000002' },
    { plate: 'SUZ001', make: 'Suzuki', model: 'Vitara', year: 2019, fuel: 'Petrol', power_kw: 82, body_style: 'SUV', gvm: 1670, vin: 'JSAAZC83S00000003' },
    { plate: 'SUZ002', make: 'Suzuki', model: 'Jimny', year: 2020, fuel: 'Petrol', power_kw: 75, body_style: 'SUV', gvm: 1645, vin: 'JSAAZC83S00000004' },
    { plate: 'SUZ003', make: 'Suzuki', model: 'Baleno', year: 2018, fuel: 'Petrol', power_kw: 66, body_style: 'Hatchback', gvm: 1310, vin: 'JSAAZC83S00000005' },
    { plate: 'SUZ004', make: 'Suzuki', model: 'Ignis', year: 2019, fuel: 'Petrol', power_kw: 66, body_style: 'Hatchback', gvm: 1150, vin: 'JSAAZC83S00000006' },
    
    // ISUZU
    { plate: 'RST012', make: 'Isuzu', model: 'D-Max', year: 2021, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3100, vin: 'MPATFS85KJK000001' },
    { plate: 'RST013', make: 'Isuzu', model: 'D-Max', year: 2020, fuel: 'Diesel', power_kw: 140, body_style: 'Utility', gvm: 3100, vin: 'MPATFS85KJK000002' },
    { plate: 'ISU001', make: 'Isuzu', model: 'MU-X', year: 2020, fuel: 'Diesel', power_kw: 140, body_style: 'SUV', gvm: 3000, vin: 'MPATFS85KJK000003' },
    { plate: 'ISU002', make: 'Isuzu', model: 'MU-X', year: 2019, fuel: 'Diesel', power_kw: 130, body_style: 'SUV', gvm: 3000, vin: 'MPATFS85KJK000004' },
    
    // SSANGYONG
    { plate: 'KRB400', make: 'Ssangyong', model: 'Actyon Sport Sports Manual 2.2 2.', year: 2017, fuel: 'Diesel', power_kw: 131, body_style: 'Utility', gvm: 2740, vin: 'KPADA1EESGP293104' },
    { plate: 'SSA001', make: 'Ssangyong', model: 'Rexton', year: 2019, fuel: 'Diesel', power_kw: 136, body_style: 'SUV', gvm: 3000, vin: 'KPADA1EESGP000001' },
    { plate: 'SSA002', make: 'Ssangyong', model: 'Tivoli', year: 2018, fuel: 'Petrol', power_kw: 94, body_style: 'SUV', gvm: 1895, vin: 'KPADA1EESGP000002' },
    
    // AUDI
    { plate: 'AUD001', make: 'Audi', model: 'A3', year: 2019, fuel: 'Petrol', power_kw: 110, body_style: 'Sedan', gvm: 1850, vin: 'WAUZZZ8V0JA000001' },
    { plate: 'AUD002', make: 'Audi', model: 'A4', year: 2018, fuel: 'Diesel', power_kw: 140, body_style: 'Sedan', gvm: 2150, vin: 'WAUZZZ8V0JA000002' },
    { plate: 'AUD003', make: 'Audi', model: 'Q5', year: 2020, fuel: 'Petrol', power_kw: 183, body_style: 'SUV', gvm: 2650, vin: 'WAUZZZ8V0JA000003' },
    { plate: 'AUD004', make: 'Audi', model: 'Q7', year: 2019, fuel: 'Diesel', power_kw: 200, body_style: 'SUV', gvm: 3230, vin: 'WAUZZZ8V0JA000004' },
    
    // BMW
    { plate: 'BMW001', make: 'BMW', model: '3 Series', year: 2019, fuel: 'Petrol', power_kw: 135, body_style: 'Sedan', gvm: 2050, vin: 'WBA8E5G50JNU00001' },
    { plate: 'BMW002', make: 'BMW', model: '5 Series', year: 2018, fuel: 'Diesel', power_kw: 140, body_style: 'Sedan', gvm: 2350, vin: 'WBA8E5G50JNU00002' },
    { plate: 'BMW003', make: 'BMW', model: 'X3', year: 2020, fuel: 'Petrol', power_kw: 185, body_style: 'SUV', gvm: 2540, vin: 'WBA8E5G50JNU00003' },
    { plate: 'BMW004', make: 'BMW', model: 'X5', year: 2019, fuel: 'Diesel', power_kw: 195, body_style: 'SUV', gvm: 3050, vin: 'WBA8E5G50JNU00004' },
    
    // MERCEDES-BENZ
    { plate: 'MER001', make: 'Mercedes-Benz', model: 'C-Class', year: 2019, fuel: 'Petrol', power_kw: 135, body_style: 'Sedan', gvm: 2100, vin: 'WDD2050761F000001' },
    { plate: 'MER002', make: 'Mercedes-Benz', model: 'E-Class', year: 2018, fuel: 'Diesel', power_kw: 143, body_style: 'Sedan', gvm: 2400, vin: 'WDD2050761F000002' },
    { plate: 'MER003', make: 'Mercedes-Benz', model: 'GLC', year: 2020, fuel: 'Petrol', power_kw: 155, body_style: 'SUV', gvm: 2580, vin: 'WDD2050761F000003' },
    { plate: 'MER004', make: 'Mercedes-Benz', model: 'GLE', year: 2019, fuel: 'Diesel', power_kw: 200, body_style: 'SUV', gvm: 3100, vin: 'WDD2050761F000004' },
    
    // LAND ROVER
    { plate: 'LR001', make: 'Land Rover', model: 'Discovery Sport', year: 2019, fuel: 'Diesel', power_kw: 132, body_style: 'SUV', gvm: 2720, vin: 'SALCA2BN0KH000001' },
    { plate: 'LR002', make: 'Land Rover', model: 'Range Rover Evoque', year: 2020, fuel: 'Petrol', power_kw: 183, body_style: 'SUV', gvm: 2550, vin: 'SALCA2BN0KH000002' },
    { plate: 'LR003', make: 'Land Rover', model: 'Range Rover Sport', year: 2018, fuel: 'Diesel', power_kw: 225, body_style: 'SUV', gvm: 3250, vin: 'SALCA2BN0KH000003' },
    
    // JEEP
    { plate: 'JEP001', make: 'Jeep', model: 'Compass', year: 2019, fuel: 'Petrol', power_kw: 114, body_style: 'SUV', gvm: 2150, vin: '1C4NJDBB0KD000001' },
    { plate: 'JEP002', make: 'Jeep', model: 'Cherokee', year: 2018, fuel: 'Diesel', power_kw: 125, body_style: 'SUV', gvm: 2540, vin: '1C4NJDBB0KD000002' },
    { plate: 'JEP003', make: 'Jeep', model: 'Grand Cherokee', year: 2019, fuel: 'Petrol', power_kw: 210, body_style: 'SUV', gvm: 3084, vin: '1C4NJDBB0KD000003' },
    { plate: 'JEP004', make: 'Jeep', model: 'Wrangler', year: 2020, fuel: 'Petrol', power_kw: 209, body_style: 'SUV', gvm: 2812, vin: '1C4NJDBB0KD000004' },
    
    // PEUGEOT
    { plate: 'PEU001', make: 'Peugeot', model: '208', year: 2018, fuel: 'Petrol', power_kw: 81, body_style: 'Hatchback', gvm: 1530, vin: 'VF3C9HZC0JS000001' },
    { plate: 'PEU002', make: 'Peugeot', model: '3008', year: 2019, fuel: 'Diesel', power_kw: 130, body_style: 'SUV', gvm: 2240, vin: 'VF3C9HZC0JS000002' },
    { plate: 'PEU003', make: 'Peugeot', model: '5008', year: 2020, fuel: 'Diesel', power_kw: 130, body_style: 'SUV', gvm: 2400, vin: 'VF3C9HZC0JS000003' },
    
    // RENAULT
    { plate: 'REN001', make: 'Renault', model: 'Clio', year: 2018, fuel: 'Petrol', power_kw: 66, body_style: 'Hatchback', gvm: 1470, vin: 'VF1RJA00557000001' },
    { plate: 'REN002', make: 'Renault', model: 'Captur', year: 2019, fuel: 'Petrol', power_kw: 88, body_style: 'SUV', gvm: 1730, vin: 'VF1RJA00557000002' },
    { plate: 'REN003', make: 'Renault', model: 'Koleos', year: 2019, fuel: 'Diesel', power_kw: 130, body_style: 'SUV', gvm: 2400, vin: 'VF1RJA00557000003' },
    
    // SKODA
    { plate: 'SKO001', make: 'Skoda', model: 'Octavia', year: 2019, fuel: 'Petrol', power_kw: 110, body_style: 'Sedan', gvm: 1950, vin: 'TMBJJ7NE0K7000001' },
    { plate: 'SKO002', make: 'Skoda', model: 'Kodiaq', year: 2020, fuel: 'Diesel', power_kw: 140, body_style: 'SUV', gvm: 2600, vin: 'TMBJJ7NE0K7000002' },
    { plate: 'SKO003', make: 'Skoda', model: 'Karoq', year: 2019, fuel: 'Petrol', power_kw: 110, body_style: 'SUV', gvm: 2150, vin: 'TMBJJ7NE0K7000003' },
    
    // VOLVO
    { plate: 'VOL001', make: 'Volvo', model: 'XC40', year: 2020, fuel: 'Petrol', power_kw: 140, body_style: 'SUV', gvm: 2300, vin: 'YV1MZ91B7L1000001' },
    { plate: 'VOL002', make: 'Volvo', model: 'XC60', year: 2019, fuel: 'Diesel', power_kw: 140, body_style: 'SUV', gvm: 2700, vin: 'YV1MZ91B7L1000002' },
    { plate: 'VOL003', make: 'Volvo', model: 'XC90', year: 2018, fuel: 'Diesel', power_kw: 173, body_style: 'SUV', gvm: 3000, vin: 'YV1MZ91B7L1000003' },
    
    // LEXUS
    { plate: 'LEX001', make: 'Lexus', model: 'IS300', year: 2019, fuel: 'Petrol', power_kw: 180, body_style: 'Sedan', gvm: 2100, vin: 'JTHBE1D28K5000001' },
    { plate: 'LEX002', make: 'Lexus', model: 'NX300', year: 2020, fuel: 'Petrol', power_kw: 175, body_style: 'SUV', gvm: 2400, vin: 'JTHBE1D28K5000002' },
    { plate: 'LEX003', make: 'Lexus', model: 'RX350', year: 2019, fuel: 'Petrol', power_kw: 218, body_style: 'SUV', gvm: 2700, vin: 'JTHBE1D28K5000003' },
  ];

  console.log(`\n📦 Preparing to cache ${vehicles.length} NZ vehicles...\n`);

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const vehicle of vehicles) {
    try {
      const existing = await prisma.vehicleCache.findUnique({
        where: { plate: vehicle.plate }
      });

      if (existing) {
        skipped++;
        continue;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

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

      // Classification logic
      const body = vehicle.body_style.toUpperCase();
      const fuel = vehicle.fuel.toUpperCase();
      
      let fuel_class: 'PETROL' | 'DIESEL' | 'EV' = 'PETROL';
      if (fuel.includes('DIESEL')) fuel_class = 'DIESEL';
      if (fuel.includes('ELECTRIC') || fuel === 'EV') fuel_class = 'EV';

      let body_class: 'CAR' | 'SUV' | 'UTE' | 'VAN' | 'PERFORMANCE' | 'COMMERCIAL' = 'CAR';
      if (body.includes('SUV')) body_class = 'SUV';
      if (body.includes('UTE') || body.includes('UTILITY')) body_class = 'UTE';
      if (body.includes('VAN')) body_class = 'VAN';
      if (body.includes('HATCHBACK') || body.includes('SEDAN') || body.includes('WAGON') || body.includes('COUPE') || body.includes('CONVERTIBLE')) body_class = 'CAR';

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
      if (added % 10 === 0) {
        console.log(`   ✅ ${added} vehicles cached...`);
      }

    } catch (error: any) {
      errors++;
      console.error(`   ❌ ${vehicle.plate}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`✅ Successfully added: ${added} vehicles`);
  console.log(`⏭️  Skipped (existing): ${skipped} vehicles`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total cache size: ${added + skipped} vehicles`);
  console.log('='.repeat(70));
  
  // Summary by make
  console.log('\n📋 Vehicles by Make:');
  const makeCount: Record<string, number> = {};
  for (const v of vehicles) {
    makeCount[v.make] = (makeCount[v.make] || 0) + 1;
  }
  Object.entries(makeCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([make, count]) => {
      console.log(`   ${make.padEnd(20)} ${count} vehicles`);
    });
  
  console.log('\n💡 All these vehicles will return instantly without MotorWeb API calls!');
  console.log('💰 Estimated savings: $' + (added * 0.50).toFixed(2) + ' (assuming $0.50 per lookup)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
