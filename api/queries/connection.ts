// 强制使用 PostgreSQL 驱动，无视 URL 协议
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    // 强制转换为 postgresql:// URL
    let url = env.databaseUrl;
    if (url.startsWith("mysql://")) {
      url = url.replace("mysql://", "postgresql://");
    }
    console.log("[DB] Connecting with URL prefix:", url.substring(0, 25));

    const pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });
    instance = drizzle(pool, { schema: fullSchema });
    console.log("[DB] Connected");
  }
  return instance;
}
