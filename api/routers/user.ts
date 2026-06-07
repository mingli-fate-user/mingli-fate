import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "mingli-fate-secret-key-2024"
);

// 生成JWT token
async function createToken(userId: number, username: string) {
  return new SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

// 验证JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as { userId: number; username: string };
  } catch {
    return null;
  }
}

export const userRouter = createRouter({
  // 注册
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6).max(100),
        nickname: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      // 检查用户名是否已存在
      const existing = await db.select().from(users).where(eq(users.username, input.username));
      if (existing.length > 0) {
        throw new Error("用户名已被注册");
      }

      // 密码强度检查
      if (input.password.length < 6) {
        throw new Error("密码至少6位");
      }
      if (!/[a-zA-Z]/.test(input.password) || !/[0-9]/.test(input.password)) {
        throw new Error("密码必须包含字母和数字");
      }

      // 哈希密码
      const passwordHash = await bcrypt.hash(input.password, 10);

      // 创建用户
      const result = await db.insert(users).values({
        username: input.username,
        passwordHash,
        nickname: input.nickname || input.username,
      }).$returningId();

      const userId = result[0].id;
      const token = await createToken(userId, input.username);

      return {
        token,
        user: {
          id: userId,
          username: input.username,
          nickname: input.nickname || input.username,
        },
      };
    }),

  // 登录
  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      const found = await db.select().from(users).where(eq(users.username, input.username));
      if (found.length === 0) {
        throw new Error("用户名或密码错误");
      }

      const user = found[0];
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("用户名或密码错误");
      }

      const token = await createToken(user.id, user.username);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname || user.username,
          avatar: user.avatar,
        },
      };
    }),

  // 获取当前用户信息
  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    const db = await getDb();
    const found = await db.select().from(users).where(eq(users.id, payload.userId));
    if (found.length === 0) {
      return null;
    }

    const user = found[0];
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname || user.username,
      avatar: user.avatar,
    };
  }),

  // 更新用户信息
  update: publicQuery
    .input(
      z.object({
        nickname: z.string().max(50).optional(),
        avatar: z.string().max(500).optional(),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) {
        throw new Error("未登录");
      }

      const db = await getDb();
      const updates: Record<string, unknown> = {};
      if (input.nickname) updates.nickname = input.nickname;
      if (input.avatar) updates.avatar = input.avatar;

      await db.update(users).set(updates).where(eq(users.id, payload.userId));

      return { ok: true };
    }),
});
