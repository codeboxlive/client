import { NextResponse } from "next/server";

export const GET = (req: Request) => {
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return NextResponse.json(
      {
        error:
          "Invalid headers. Please include an Authorization header with a Teams auth token.",
      },
      { status: 500 }
    );
  }

  try {
    throw new Error("Not implemented exception");
  } catch (error) {
    return NextResponse.json(
      {
        error: "Token exchange failed.",
      },
      { status: 500 }
    );
  }
};
