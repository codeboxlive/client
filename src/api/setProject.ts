"use server";

import { MongoClient, ObjectId } from "mongodb";
import { getUserId } from ".";
import { CodeboxMongoClient } from "./internal";
import { PROJECTS_COLLECTION_ID } from "@/constants";
import { IPostProjectResponse, IProject, ISetProject } from "@/models";

interface json {
  [key: string]: any;
}

export async function setProject(
  body: ISetProject
): Promise<IPostProjectResponse> {
  const userId = await getUserId();

  // Reset to new object in case there is extra data attached to object
  const setProject: json = {};
  if (body.title) {
    setProject.title = body.title;
  }
  if (body.createdById) {
    setProject.createdById = body.createdById;
  }

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
  // select all that match containerId
  const query = { _id: new ObjectId(body._id) };
  // do not set sandboxContainerId if already known
  if (body.sandboxContainerId || body.containerId) {
    try {
      // Insert via upsert (create or replace) doc to collection directly
      const checkProject = await collection.findOne<IProject>(query);
      if (checkProject) {
        if (!checkProject.sandboxContainerId && body.sandboxContainerId) {
          // Since there is not yet a container ID, we allow it to upsert
          setProject.sandboxContainerId = body.sandboxContainerId;
        }
        if (!checkProject.containerId && body.containerId) {
          // Since there is not yet a container ID, we allow it to upsert
          setProject.containerId = body.containerId;
        }
      }
    } catch (error) {
      // Do nothing
      console.error(
        "CodeboxSetProject: attempting to set project that is not found"
      );
    }
  }

  const update = { $set: setProject };

  // Insert via upsert (create or replace) doc to collection directly
  const updateResult = await collection.updateOne(query, update);
  console.log(`updateResult: ${JSON.stringify(updateResult)}\n`);
  const project: IProject | null = await collection.findOne<IProject>(query);
  if (!project) {
    throw new Error(
      "Unable to update a project for non-existing project with _id: " +
        body._id
    );
  }

  const projectResponse: IPostProjectResponse = {
    project,
  };
  return projectResponse;
}
