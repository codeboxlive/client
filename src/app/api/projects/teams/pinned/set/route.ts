"use server";
import { NextResponse } from "next/server";
import { postTeamsPinnedProject } from "@/api";
import { isPostTeamsPinnedProjectBody } from "@/models";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  if (!isPostTeamsPinnedProjectBody(body)) {
    throw new Error(
      "Invalid response type. Please ensure the body adheres to IPostTeamsPinnedProjectBody interface"
    );
  }
  await postTeamsPinnedProject(body);
  return NextResponse.json(body);
}
