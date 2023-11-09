import { MongoClient } from "mongodb";

const COSMOS_CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING!;
const client = new MongoClient(COSMOS_CONNECTION_STRING);

export class CodeboxMongoClient {
  private static clientPromise: Promise<MongoClient> | undefined;
  public static async getClient(): Promise<MongoClient> {
    if (this.clientPromise === undefined) {
      this.clientPromise = this.getClientPromise();
    }
    return this.clientPromise;
  }
  private static async getClientPromise(): Promise<MongoClient> {
    await client.connect();
    return client;
  }
}
