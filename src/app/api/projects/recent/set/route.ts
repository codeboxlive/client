"use server";
import { NextResponse } from "next/server";
import { postRecentViewedProject } from "@/api";
import { isPostRecentViewedProjectBody } from "@/models";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  if (!isPostRecentViewedProjectBody(body)) {
    throw new Error(
      "Invalid response type. Please ensure the body adheres to IPostRecentViewedProjectBody interface"
    );
  }
  await postRecentViewedProject(body);
  return NextResponse.json(body);
}
