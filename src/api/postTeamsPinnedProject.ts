"use server";
"use server"

import { MongoClient } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { IJoin, IPostTeamsPinnedProjectBody, JoinType } from "@/models";
import { JOIN_COLLECTION_ID, PROJECTS_COLLECTION_ID } from "@/constants";
import moment from "moment";

export async function postTeamsPinnedProject(
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
  const db = client.db(`codebox-live`);
  console.log(`Using database:\t${db.databaseName}\n`);
  const joinCollection = db.collection(JOIN_COLLECTION_ID);
  const join: Partial<IJoin> = {
    id1: body.threadId,
    id1Type: JoinType.TeamsThreadId,
    id2: body.projectId,
    id2Type: JoinType.ProjectId,
  };
  let joins: IJoin[] = await joinCollection.find<IJoin>(join).toArray();
  joins.sort((a, b) => {
    const isAfter = moment(a.date).isBefore(b.date);
    if (isAfter) {
      return 1;
    }
    const isEqual = moment(a.date).isSame(b.date);
    if (isEqual) {
      return 0;
    }
    return -1;
  });
  const collection = db.collection(PROJECTS_COLLECTION_ID);
  console.log(`Using collection:\t${collection.collectionName}\n`);
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
