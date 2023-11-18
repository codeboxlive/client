import { NextResponse } from "next/server";

export const GET = (req: Request) => {
  console.log("attempting to get profile");
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      {
        error: "Invalid request. Must include Authorization header.",
      },
      { status: 400 }
    );
  }
  const token = authHeader.replace("Bearer ", "");
  // TODO: get microsoft profile
  return NextResponse.json(
    {
      sub: "fakeId",
      email: "xxblissfitxx@gmail.com",
      name: "Ryan Test",
      tid: "fakeTenantId",
    },
    { status: 200 }
  );
};
