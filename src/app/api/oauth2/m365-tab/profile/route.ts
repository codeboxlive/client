import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  console.log("attempting to get profile");
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.error("Invalid request. Must include Authorization header.");
    return NextResponse.json(
      {
        error: "Invalid request. Must include Authorization header.",
      },
      { status: 400 }
    );
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === "string") {
      throw new Error("Invalid jwt");
    }
    const oid = decoded["oid"];
    if (typeof oid !== "string") {
      console.error("Invalid oid in token.");
      return NextResponse.json(
        {
          error: "Invalid oid in token.",
        },
        { status: 401 }
      );
    }
    const tid = decoded["tid"];
    if (typeof tid !== "string") {
      console.error("Invalid tid in token.");
      return NextResponse.json(
        {
          error: "Invalid tid in token.",
        },
        { status: 401 }
      );
    }
    if (decoded["aud"] !== "https://graph.microsoft.com") {
      console.error("Invalid aud in token of", decoded["aud"]);
      return NextResponse.json(
        {
          error: "Invalid aud in token.",
        },
        { status: 401 }
      );
    }
    if (decoded["iss"] !== `https://sts.windows.net/${decoded["tid"]}/`) {
      console.error("Invalid iss in token of", decoded["iss"]);
      return NextResponse.json(
        {
          error: "Invalid tid in token.",
        },
        { status: 401 }
      );
    }
    if (decoded["appid"] !== process.env.AAD_CLIENT_ID) {
      console.error("Invalid appid in token of", decoded["appid"]);
      return NextResponse.json(
        {
          error: "Invalid appid in token.",
        },
        { status: 401 }
      );
    }
    console.log("m365-tab/profile", JSON.stringify(decoded));
    return NextResponse.json(
      {
        oid,
        sub: decoded.sub,
        email: decoded.upn,
        name: decoded.name,
        family_name: decoded.family_name,
        given_name: decoded.given_name,
        tid,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Internal error:", err);
    return NextResponse.json(
      {
        error: "Internal error.",
      },
      { status: 500 }
    );
  }
};
