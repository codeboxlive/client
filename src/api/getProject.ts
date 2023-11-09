"use server";

import { MongoClient, ObjectId } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { IGetProject, IPostProjectResponse, IProject } from "@/models";
import { PROJECTS_COLLECTION_ID } from "@/constants";

export async function getProject(
  body: IGetProject
): Promise<IPostProjectResponse> {
  const userId = await getUserId();
  let client: MongoClient;
  try {
    client = await CodeboxMongoClient.getClient();
  } catch (error) {
    throw new Error("Unable to get MongoDB client");
  }
  // Database reference with creation if it does not already exist
  const db = client.db(`codebox-live`);
  console.log(`Using database:\t${db.databaseName}\n`);
  const collection = db.collection(PROJECTS_COLLECTION_ID);
  console.log(`Using collection:\t${collection.collectionName}\n`);
  // select all that match userId
  const query = {
    _id: new ObjectId(body.projectId),
  };
  const project = await collection.findOne<IProject>(query);

  if (!project) {
    throw new Error("Project not found for id: " + body.projectId);
  }
  return {
    project: project,
  };
}
