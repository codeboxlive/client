"use server";
import { NextResponse } from "next/server";
import { deleteProject } from "@/api";
import { isDeleteProject } from "@/models";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const body = await req.json();
  if (!isDeleteProject(body)) {
    throw new Error(
      "Invalid response type. Please ensure the body adheres to IDeleteProject interface"
    );
  }
  const projectResponse = await deleteProject(body);
  return NextResponse.json(projectResponse);
}
