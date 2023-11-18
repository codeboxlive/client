import validateTeamsToken from "@/api/validateTeamsToken";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
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
    const decoded = await validateTeamsToken(
      authorization.replace("Bearer ", "")
    );
    const response = NextResponse.json(decoded, {
      status: 200,
    });
    response.cookies.set({
      name: "TeamsAuthorization",
      value: authorization,
      sameSite: "none",
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Token exchange failed.",
      },
      { status: 500 }
    );
  }
};
