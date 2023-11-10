"use server";

import { MongoClient } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { IJoin, IPostRecentViewedProjectBody, JoinType } from "@/models";
import { JOIN_COLLECTION_ID } from "@/constants";

export async function postRecentViewedProject(
  body: IPostRecentViewedProjectBody
): Promise<void> {
  const userId = await getUserId();
  let client: MongoClient;
  try {
    client = await CodeboxMongoClient.getClient();
  } catch (error) {
    throw new Error("Unable to get MongoDB client");
  }
  const join: Partial<IJoin> = {
    id1: userId,
    id1Type: JoinType.UserId,
    id2: body.projectId,
    id2Type: JoinType.ProjectId,
  };
  // Database reference with creation if it does not already exist
  const db = client.db(`codebox-live`);
  console.log(`Using database:\t${db.databaseName}\n`);
  const collection = db.collection(JOIN_COLLECTION_ID);
  console.log(`Using collection:\t${collection.collectionName}\n`);
  // select all that match containerId

   // Insert via upsert (create or replace) doc to collection directly
   const insertResult = await collection.updateOne(
    join,
    {
      $set: {
        ...join,
        date: new Date(),
        userId,
      },
    },
    { upsert: true }
  );
  console.log(`insertResult: ${JSON.stringify(insertResult)}\n`);
}
