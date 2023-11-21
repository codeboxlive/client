"use server";

import { MongoClient } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { IJoin, IPostTeamsPinnedProjectBody, JoinType } from "@/models";
import { JOIN_COLLECTION_ID } from "@/constants";

export async function deleteTeamsPinnedProject(
  body: IPostTeamsPinnedProjectBody
): Promise<void> {
  const userId = await getUserId();
  let client: MongoClient;
  try {
    client = await CodeboxMongoClient.getClient();
  } catch (error) {
    throw new Error("Unable to get MongoDB client");
  }
  // Database reference with creation if it does not already exist
  const query: Partial<IJoin> = {
    id1: body.threadId,
    id1Type: JoinType.TeamsThreadId,
    id2: body.projectId,
    id2Type: JoinType.ProjectId,
  };
  // Database reference with creation if it does not already exist
  const db = client.db(`codebox-live`);
  console.log(`Using database:\t${db.databaseName}\n`);
  const collection = db.collection(JOIN_COLLECTION_ID);
  console.log(`Using collection:\t${collection.collectionName}\n`);

  // Insert via upsert (create or replace) doc to collection directly
  const insertResult = await collection.deleteMany(query);
  console.log(`insertResult: ${JSON.stringify(insertResult)}\n`);
}
