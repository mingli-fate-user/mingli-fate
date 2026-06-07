import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { mianxiangRecords } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./user";

export const mianxiangRouter = createRouter({
  // 保存面相解析记录
  save: publicQuery
    .input(
      z.object({
        mode: z.string(),
        messages: z.array(z.any()),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      const result = await db.insert(mianxiangRecords).values({
        userId: payload.userId,
        mode: input.mode,
        messages: input.messages,
      }).$returningId();

      return { id: result[0].id };
    }),

  // 获取我的面相解析记录
  myRecords: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) return [];

      const db = await getDb();
      const results = await db.select()
        .from(mianxiangRecords)
        .where(eq(mianxiangRecords.userId, payload.userId))
        .orderBy(desc(mianxiangRecords.createdAt));

      return results.map((r: any) => ({
        id: r.id,
        mode: r.mode,
        messages: r.messages,
        createdAt: r.createdAt,
      }));
    }),

  // 删除面相解析记录
  delete: publicQuery
    .input(z.object({ id: z.number(), token: z.string() }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      await db.delete(mianxiangRecords).where(eq(mianxiangRecords.id, input.id));
      return { ok: true };
    }),
});
