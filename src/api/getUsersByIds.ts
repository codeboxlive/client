import { IPrivateUserInfoExt, IPublicUserInfo } from "@/models";
import { MongoClient } from "mongodb";
import { CodeboxMongoClient } from "./internal";
import { getPrivateUserInfo } from ".";
import { USERS_COLLECTION_ID } from "@/constants";

export async function getUsersByIds(ids: string[]): Promise<IPublicUserInfo[]> {
  let client: MongoClient;
  try {
    client = await CodeboxMongoClient.getClient();
  } catch (error) {
    throw new Error("Unable to get MongoDB client");
  }
  const userInfo = await getPrivateUserInfo();
  // Database reference with creation if it does not already exist
  const db = client.db(`codebox-live`);
  console.log(`Using database:\t${db.databaseName}\n`);
  const collection = db.collection(USERS_COLLECTION_ID);
  console.log(`Using collection:\t${collection.collectionName}\n`);

  const users = await collection
    .find<IPrivateUserInfoExt>({
      sub: {
        $in: ids,
      },
    })
    .toArray();
  return users.map((privateProfile) => {
    return {
      sub: privateProfile.sub,
      name: privateProfile.name,
      family_name: privateProfile.family_name,
      given_name: privateProfile.given_name,
      picture: privateProfile.picture,
    };
  });
}
