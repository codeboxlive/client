import { NextResponse } from "next/server";

export const GET = (req: Request) => {
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
      user_id: "fakeId",
      email: "xxblissfitxx@gmail.com",
      name: "Ryan Test",
      app_metadata: {
        _m366_tab: {
          tid: "fakeTenantId",
        },
      },
    },
    { status: 200 }
  );
};
