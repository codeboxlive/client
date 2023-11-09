"use server";
import { NextResponse } from "next/server";
import { getProject } from "@/api";
import { isGetProject } from "@/models";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  if (!isGetProject(body)) {
    throw new Error(
      "Invalid response type. Please ensure the body adheres to IGetProject interface"
    );
  }
  const projectResponse = await getProject(body);
  return NextResponse.json(projectResponse);
}
