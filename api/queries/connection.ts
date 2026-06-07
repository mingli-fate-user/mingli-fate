import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    const pool = new pg.Pool({
      connectionString: env.databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
    instance = drizzle(pool, { schema: fullSchema });
  }
  return instance;
}
