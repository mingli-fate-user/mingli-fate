import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { apiKeys } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "./user";

export const apiKeyRouter = createRouter({
  save: publicQuery
    .input(z.object({
      key: z.string().min(10),
      provider: z.string().default("siliconflow"),
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();

      // 先禁用之前激活的key
      await db.update(apiKeys)
        .set({ isActive: 0 })
        .where(eq(apiKeys.userId, payload.userId));

      // 插入新key
      const result = await db.insert(apiKeys).values({
        userId: payload.userId,
        provider: input.provider,
        key: input.key,
        isActive: 1,
      }).returning({ id: apiKeys.id });

      return { id: result[0].id };
    }),

  myKey: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) return null;

      const db = getDb();
      const keys = await db.select()
        .from(apiKeys)
        .where(and(
          eq(apiKeys.userId, payload.userId),
          eq(apiKeys.isActive, 1)
        ))
        .limit(1);

      if (keys.length === 0) return null;

      const key = keys[0].key;
      return {
        id: keys[0].id,
        provider: keys[0].provider,
        prefix: key.slice(0, 8) + "..." + key.slice(-4),
        hasKey: true,
      };
    }),

  test: publicQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const resp = await fetch("https://api.siliconflow.cn/v1/models", {
          headers: { Authorization: `Bearer ${input.key}` },
        });
        if (resp.ok) {
          return { valid: true, message: "API密钥验证成功" };
        } else {
          return { valid: false, message: "API密钥无效或已过期" };
        }
      } catch {
        return { valid: false, message: "网络错误，无法验证" };
      }
    }),

  delete: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      await db.delete(apiKeys).where(eq(apiKeys.userId, payload.userId));
      return { ok: true };
    }),
});
