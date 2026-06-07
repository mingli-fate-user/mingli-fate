import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
} from "drizzle-orm/mysql-core";

// ==================== 用户表 ====================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull().default(""),
  nickname: varchar("nickname", { length: 50 }),
  avatar: varchar("avatar", { length: 500 }),
  unionId: varchar("union_id", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  lastSignInAt: timestamp("last_sign_in_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==================== 社区帖子表 ====================
export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  likes: int("likes").notNull().default(0),
  commentsCount: int("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==================== 社区评论表 ====================
export const comments = mysqlTable("comments", {
  id: serial("id").primaryKey(),
  postId: int("post_id").notNull(),
  userId: int("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== API密钥表 ====================
export const apiKeys = mysqlTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  provider: varchar("provider", { length: 50 }).notNull().default("siliconflow"),
  key: text("key").notNull(),
  isActive: int("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== AI聊天记录表 ====================
export const aiChats = mysqlTable("ai_chats", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  toolType: varchar("tool_type", { length: 50 }).notNull(),
  recordId: int("record_id"),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== 面相解析记录表 ====================
export const mianxiangRecords = mysqlTable("mianxiang_records", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  mode: varchar("mode", { length: 20 }).notNull(),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== 排盘记录表 ====================
export const records = mysqlTable("records", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  data: json("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
