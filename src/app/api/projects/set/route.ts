"use server";
import { NextResponse } from "next/server";
import { setProject } from "@/api";
import { isSetProject } from "@/models";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  if (!isSetProject(body)) {
    throw new Error(
      "Invalid response type. Please ensure the body adheres to IPostProject interface"
    );
  }
  const projectResponse = await setProject(body);
  return NextResponse.json(projectResponse);
}
