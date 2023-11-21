"use server";

import { MongoClient } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { PROJECTS_COLLECTION_ID } from "@/constants";
import {
  IPostProject,
  IPostProjectResponse,
  IProject,
  IProjectProps,
} from "@/models";

export async function createProject(
  body: IPostProject
): Promise<IPostProjectResponse> {
  const userId = await getUserId();

  const currentDate = new Date();
  const createProject: IProjectProps = {
    ...body,
    createdAt: currentDate,
    createdById: userId,
    lastUpdatedDate: currentDate, 
    lastUpdatedById: userId,
  };

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
  // Insert via upsert (create or replace) doc to collection directly
  const insertResult = await collection.insertOne(createProject);
  console.log(`insertResult: ${JSON.stringify(insertResult)}\n`);
  const project: IProject = {
    _id: insertResult.insertedId.toString(),
    ...createProject,
  };
  return {
    project,
  };
}
