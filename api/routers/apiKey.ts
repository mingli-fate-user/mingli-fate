import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { apiKeys } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "./user";

export const apiKeyRouter = createRouter({
  // 保存用户的API密钥
  save: publicQuery
    .input(
      z.object({
        key: z.string().min(10),
        provider: z.string().default("siliconflow"),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();

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
      }).$returningId();

      return { id: result[0].id };
    }),

  // 获取用户当前激活的API密钥
  myKey: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) return null;

      const db = await getDb();
      const keys = await db.select()
        .from(apiKeys)
        .where(and(
          eq(apiKeys.userId, payload.userId),
          eq(apiKeys.isActive, 1)
        ))
        .limit(1);

      if (keys.length === 0) return null;

      // 只返回前缀，不暴露完整key
      const key = keys[0].key;
      return {
        id: keys[0].id,
        provider: keys[0].provider,
        prefix: key.slice(0, 8) + "..." + key.slice(-4),
        hasKey: true,
      };
    }),

  // 测试API密钥是否可用
  test: publicQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const resp = await fetch("https://api.siliconflow.cn/v1/models", {
          headers: {
            Authorization: `Bearer ${input.key}`,
          },
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

  // 删除用户的API密钥
  delete: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      await db.delete(apiKeys).where(eq(apiKeys.userId, payload.userId));
      return { ok: true };
    }),
});
