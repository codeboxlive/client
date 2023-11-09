"use server";

import { MongoClient, ObjectId } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { PROJECTS_COLLECTION_ID } from "@/constants";
import { IDeleteProject } from "@/models";

export async function deleteProject(
  body: IDeleteProject
): Promise<IDeleteProject> {
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
  // delete object matching projectId
  const query = { _id: new ObjectId(body.projectId) };

  // TODO: delete AFR document as well
  // Insert via upsert (create or replace) doc to collection directly
  const deleteResult = await collection.deleteOne(query);
  if (deleteResult.deletedCount >= 1) {
    return body;
  }
  throw new Error(
    "Failed to delete the project as there was no project matching _id: " +
      body.projectId
  );
}
