"use server";
import { NextResponse } from "next/server";
import { getPublicUserInfo } from "@/api";
import { generateToken } from "@fluidframework/azure-service-utils";
import { ScopeType } from "@fluidframework/azure-client";
import { isGetFluidTokenBody } from "@/models";
import { AZURE_FLUID_RELAY_WEST_US2_TENANT_ID } from "@/constants";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  if (!isGetFluidTokenBody(body)) {
    throw new Error(
      "Invalid response type. Please ensure the body adheres to IGetFluidTokenBody interface"
    );
  }
  const userInfo = await getPublicUserInfo();
  const AZURE_FLUID_RELAY_KEY_WEST_US2 =
    process.env.AZURE_FLUID_RELAY_KEY_WEST_US2;
  if (!AZURE_FLUID_RELAY_KEY_WEST_US2) {
    throw new Error("Invalid AFR tenant secret");
  }
  const user = {
    name: userInfo.name,
    id: userInfo.sub,
    picture: userInfo.picture,
  };

  // Will generate the token and returned by an ITokenProvider implementation to use with the AzureClient.
  const token = generateToken(
    AZURE_FLUID_RELAY_WEST_US2_TENANT_ID,
    AZURE_FLUID_RELAY_KEY_WEST_US2,
    [ScopeType.DocRead, ScopeType.DocWrite, ScopeType.SummaryWrite],
    body.containerId,
    user
  );
  return NextResponse.json({
    token,
  });
}
