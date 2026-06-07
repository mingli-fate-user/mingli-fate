import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const JWT_SECRET = env.jwtSecret || "mingli-fate-default-secret";

// 简单密码哈希（实际应用应使用 bcrypt）
function hashPassword(password: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(password + JWT_SECRET).digest("hex");
}

export function signToken(userId: number, username: string): string {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
  } catch {
    return null;
  }
}

export const userRouter = createRouter({
  // 注册
  register: publicQuery
    .input(z.object({
      username: z.string().min(3).max(50),
      password: z.string().min(6),
      nickname: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // 检查用户名是否已存在
      const existing = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (existing.length > 0) {
        throw new Error("用户名已存在");
      }

      // 创建用户 - PostgreSQL 用 returning
      const result = await db.insert(users).values({
        username: input.username,
        passwordHash: hashPassword(input.password),
        nickname: input.nickname || input.username,
        role: "user",
      }).returning({ id: users.id });

      const userId = result[0].id;
      const token = signToken(userId, input.username);

      return { token, userId };
    }),

  // 登录
  login: publicQuery
    .input(z.object({
      username: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const rows = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (rows.length === 0) {
        throw new Error("用户名或密码错误");
      }

      const user = rows[0];
      if (user.passwordHash !== hashPassword(input.password)) {
        throw new Error("用户名或密码错误");
      }

      const token = signToken(user.id, user.username);
      return { token, userId: user.id };
    }),

  // 获取当前用户信息
  me: publicQuery
    .query(async ({ ctx }) => {
      const authHeader = ctx.req.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) return null;

      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      if (!payload) return null;

      const db = getDb();
      const rows = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
      return rows.at(0) || null;
    }),
});
