import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    console.log("[DB] Using node-postgres driver");
    console.log("[DB] URL prefix:", env.databaseUrl?.substring(0, 15));
    const pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
    instance = drizzle(pool, { schema: fullSchema });
    console.log("[DB] node-postgres driver ready");
  }
  return instance;
}
