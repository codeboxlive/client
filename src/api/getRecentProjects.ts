"use server";

import { MongoClient, ObjectId } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { IJoin, IProject, IUserProjectsResponse, JoinType } from "@/models";
import { JOIN_COLLECTION_ID, PROJECTS_COLLECTION_ID } from "@/constants";
import moment from "moment";

export async function getRecentProjects(): Promise<IUserProjectsResponse> {
  const userId = await getUserId();
  let client: MongoClient;
  try {
    client = await CodeboxMongoClient.getClient();
  } catch (error) {
    throw new Error("Unable to get MongoDB client");
  }
  // Database reference with creation if it does not already exist
  const db = client.db(`codebox-live`);
  console.log(`getRecentProjects: Using database:\t${db.databaseName}\n`);
  const joinCollection = db.collection(JOIN_COLLECTION_ID);
  const joinCollectionQuery = {
    id1: userId,
    id1Type: JoinType.UserId,
    id2Type: JoinType.ProjectId,
  };
  let joins: IJoin[] = await joinCollection.find<IJoin>(joinCollectionQuery).toArray();
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
  console.log(`getRecentProjects: Using collection:\t${collection.collectionName}\n`);
  // select all that match userId
  const recentProjectsQuery = {
    _id: {
      $in: joins.map((join) => new ObjectId(join.id2)),
    },
  };
  let projects: IProject[] = [];
  const unsortedProjects = await collection
    .find<IProject>(recentProjectsQuery)
    .toArray();
  for (let joinIndex = 0; joinIndex < joins.length; joinIndex++) {
    const join = joins[joinIndex];
    const project = unsortedProjects.find(
      (checkProject) => `${checkProject._id}` === `${join.id2}`
    );
    if (project !== undefined) {
      projects.push(project);
    }
  }
  const projectResponse: IUserProjectsResponse = {
    projects,
  };
  console.log("getRecentProjects: got response successfully")
  return projectResponse;
}
