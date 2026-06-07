import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    console.log("[DB] Creating postgres-js client...");
    console.log("[DB] URL prefix:", env.databaseUrl?.substring(0, 30));
    const client = postgres(env.databaseUrl, {
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
    instance = drizzle(client, { schema: fullSchema });
    // DEBUG: print dialect escapeName
    const dialect = (instance as any).session?.dialect;
    if (dialect) {
      console.log("[DB] Dialect escapeName test:", dialect.escapeName("users"));
      console.log("[DB] Dialect constructor:", dialect.constructor?.name);
    }
    console.log("[DB] postgres-js client created");
  }
  return instance;
}
