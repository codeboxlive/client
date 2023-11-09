"use server";
import { NextResponse } from "next/server";
import { getUserId } from "@/api";
import { isGetFluidTokenBody } from "@/models";
import {
  AZURE_FLUID_RELAY_WEST_US2_SERVICE_ENDPOINT,
  AZURE_FLUID_RELAY_WEST_US2_TENANT_ID,
} from "@/constants";

export async function POST(req: Request) {
  const userId = await getUserId();
  console.log("npt-time.POST: userId is requesting npt time", userId);
  // Use connect method to connect to the server
  const now = new Date();
  const serverTime = {
    ntpTime: now.toUTCString(),
    ntpTimeInUTC: now.getTime(),
  };
  return NextResponse.json(serverTime);
}
