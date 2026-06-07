// 数据库初始化脚本 - PostgreSQL (postgres-js)
import postgres from "postgres";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function init() {
  const sql = postgres(dbUrl, {
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  try {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      nickname VARCHAR(50),
      avatar TEXT,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      title TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      provider VARCHAR(50) NOT NULL DEFAULT 'siliconflow',
      key TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS ai_chats (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      tool_type VARCHAR(50) NOT NULL,
      record_id INTEGER,
      messages JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS mianxiang_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      mode VARCHAR(20) NOT NULL,
      messages JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`;

    await sql.end();
    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Database init failed:", err.message);
    process.exit(1);
  }
}

init();
