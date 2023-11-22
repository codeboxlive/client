"use server";

import { MongoClient } from "mongodb";
import { CodeboxMongoClient } from "./internal";
import { getPrivateUserInfo, getUserId } from ".";
import { USERS_COLLECTION_ID } from "@/constants";
import { Session } from "@auth0/nextjs-auth0";
import { sessionToIPrivateUserInfo } from "@/utils/auth-utils";

/**
 * THIS API SHOULD ONLY BE USED INTERNALLY
 */
export async function upsertUser(session: Session): Promise<void> {
  let client: MongoClient;
  try {
    client = await CodeboxMongoClient.getClient();
  } catch (error) {
    throw new Error("Unable to get MongoDB client");
  }
  const userInfo = sessionToIPrivateUserInfo(session);
  // Database reference with creation if it does not already exist
  const db = client.db(`codebox-live`);
  console.log(`Using database:\t${db.databaseName}\n`);
  const collection = db.collection(USERS_COLLECTION_ID);
  console.log(`Using collection:\t${collection.collectionName}\n`);
  // select all that match containerId
  const userToUpsert = {
    sub: userInfo.sub,
    name: userInfo.name,
    family_name: userInfo.family_name,
    given_name: userInfo.given_name,
    picture: userInfo.picture,
    email: userInfo.email,
    phone_number: userInfo.phone_number,
  };

  // Insert via upsert (create or replace) doc to collection directly
  const insertResult = await collection.updateOne(
    {
        sub: userInfo.sub,
    },
    {
      $set: {
        ...userToUpsert,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      }
    },
    { upsert: true }
  );
  if (!insertResult.acknowledged) {
    console.error("upsertUser: failed to upsert");
    throw new Error("upsertUser: Unable to upsert user");
  }
  console.log("upsertUser: successful upsert");
}
