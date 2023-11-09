"use server";

import { MongoClient } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { IProject, IUserProjectsResponse } from "@/models";
import { PROJECTS_COLLECTION_ID } from "@/constants";
import moment from "moment";

export async function getUserProjects(): Promise<IUserProjectsResponse> {
  const userId = await getUserId();
  let client: MongoClient;
  try {
    client = await CodeboxMongoClient.getClient();
  } catch (error) {
    throw new Error("Unable to get MongoDB client");
  }
  // Database reference with creation if it does not already exist
  const db = client.db(`codebox-live`);
  console.log(`getUserProjects: Using database:\t${db.databaseName}\n`);
  const collection = db.collection(PROJECTS_COLLECTION_ID);
  console.log(`getUserProjects: Using collection:\t${collection.collectionName}\n`);
  // select all that match userId
  const userProjectsQuery = {
    createdById: userId,
  };
  const userProjects = (await collection
    .find<IProject>(userProjectsQuery)
    .toArray())
    .sort((a, b) => {
      const isAfter = moment(a.createdAt).isBefore(b.createdAt);
      if (isAfter) {
        return 1;
      }
      const isEqual = moment(a.createdAt).isSame(b.createdAt);
      if (isEqual) {
        return 0;
      }
      return -1;
    });

  const projectResponse: IUserProjectsResponse = {
    projects: userProjects,
  };
  return projectResponse;
}
