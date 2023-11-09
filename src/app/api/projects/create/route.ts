"use server";
import { NextResponse } from "next/server";
import { createProject } from "@/api";
import { isPostProject } from "@/models";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  if (!isPostProject(body)) {
    throw new Error(
      "Invalid response type. Please ensure the body adheres to IPostProject interface"
    );
  }
  const projectResponse = await createProject(body);
  return NextResponse.json(projectResponse);
}
