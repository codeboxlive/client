import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";

export async function middleware(request: NextRequest) {
  const auth = request.cookies.get("Authorization");
  let response: NextResponse;
  
  if (request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/projects", request.url));
  } else {
    response = NextResponse.next();
  }

  if (!auth) {
    response.cookies.set("Authorization", `Bearer ${uuid()}`);
  }

  return response;
}
