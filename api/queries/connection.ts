import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    const client = postgres(env.databaseUrl, {
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}
