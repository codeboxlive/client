import validateTeamsToken from "@/api/validateTeamsToken";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
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
  try {
    const decoded = await validateTeamsToken(token);
    const oid = decoded["oid"];
    if (typeof oid !== "string") {
      return NextResponse.json(
        {
          error: "Invalid oid in token.",
        },
        { status: 401 }
      );
    }
    const tid = decoded["tid"];
    if (typeof tid !== "string") {
      return NextResponse.json(
        {
          error: "Invalid tid in token.",
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        oid,
        sub: decoded.sub,
        email: decoded.preferred_username,
        name: decoded.name,
        tid,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Internal error.",
      },
      { status: 500 }
    );
  }
};
