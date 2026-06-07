// 数据库初始化脚本 - 在服务器启动前运行
import mysql from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function init() {
  try {
    const pool = mysql.createPool({
      uri: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionLimit: 1,
    });

    const conn = await pool.getConnection();

    // 创建 users 表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL DEFAULT '',
        nickname VARCHAR(50),
        avatar VARCHAR(500),
        union_id VARCHAR(255),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        last_sign_in_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 创建 api_keys 表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        provider VARCHAR(50) NOT NULL DEFAULT 'siliconflow',
        \`key\` TEXT NOT NULL,
        is_active INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 创建 ai_chats 表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_chats (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        tool_type VARCHAR(50) NOT NULL,
        record_id INT UNSIGNED,
        messages JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 创建 mianxiang_records 表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS mianxiang_records (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        mode VARCHAR(20) NOT NULL,
        messages JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 创建 records 表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS records (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        tool_type VARCHAR(50) NOT NULL,
        title VARCHAR(255),
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 创建 posts 表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 创建 comments 表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        post_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    conn.release();
    await pool.end();

    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Database init failed:", err.message);
    // 不退出，让服务器仍然尝试启动
  }
}

init();
