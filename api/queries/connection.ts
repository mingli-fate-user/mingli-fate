import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

// DEBUG
console.log("[DB] databaseUrl:", env.databaseUrl?.substring(0, 30) + "...");

export function getDb() {
  if (!instance) {
    console.log("[DB] Creating postgres-js client...");
    const client = postgres(env.databaseUrl, {
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
    instance = drizzle(client, { schema: fullSchema });
    console.log("[DB] postgres-js client created");
  }
  return instance;
}
