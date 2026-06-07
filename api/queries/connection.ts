import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export async function getDb() {
  if (!instance) {
    const pool = mysql.createPool({
      uri: env.databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionLimit: 5,
    });
    instance = drizzle(pool, { schema: fullSchema, mode: "planetscale" });
  }
  return instance;
}
