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
  const AZURE_FLUID_RELAY_KEY_WEST_US2 =
    process.env.AZURE_FLUID_RELAY_KEY_WEST_US2;
  if (!AZURE_FLUID_RELAY_KEY_WEST_US2) {
    throw new Error("Invalid AFR tenant secret");
  }
  const tenantInfo = {
    type: "remote",
    tenantId: AZURE_FLUID_RELAY_WEST_US2_TENANT_ID,
    serviceEndpoint: AZURE_FLUID_RELAY_WEST_US2_SERVICE_ENDPOINT,
  };
  return NextResponse.json(tenantInfo);
}
