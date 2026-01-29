/**
 * Vehicle Lookup API
 * GET /api/vehicle/[plate]
 * 
 * Looks up vehicle details by NZ registration plate
 */

import { NextRequest, NextResponse } from "next/server";
import { lookupVehicle, normalizePlate, isValidNZPlate } from "@/server/carjam";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ plate: string }> }
) {
  try {
    const { plate } = await params;
    
    if (!plate) {
      return NextResponse.json(
        { error: "Plate parameter is required" },
        { status: 400 }
      );
    }

    const normalized = normalizePlate(plate);

    if (!isValidNZPlate(normalized)) {
      return NextResponse.json(
        { 
          found: false,
          plate: normalized,
          error: "Invalid plate format. NZ plates are 1-6 alphanumeric characters." 
        },
        { status: 400 }
      );
    }

    const result = await lookupVehicle(normalized);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API] Vehicle lookup error:", error);
    return NextResponse.json(
      { 
        found: false,
        error: "Failed to lookup vehicle. Please try again." 
      },
      { status: 500 }
    );
  }
}
