"use server";
import { NextResponse } from "next/server";
import { getTeamsPinnedProjects } from "@/api";
import { isGetTeamsPinnedProjectsBody } from "@/models";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  if (!isGetTeamsPinnedProjectsBody(body)) {
    throw new Error(
      "Invalid response type. Please ensure the body adheres to IGetTeamsPinnedProjectsBody interface"
    );
  }
  const response = await getTeamsPinnedProjects(body);
  return NextResponse.json(response);
}
