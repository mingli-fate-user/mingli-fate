import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { records } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./user";

export const recordRouter = createRouter({
  // 保存排盘记录
  save: publicQuery
    .input(
      z.object({
        type: z.string(),
        name: z.string(),
        data: z.any(),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      const result = await db.insert(records).values({
        userId: payload.userId,
        type: input.type,
        name: input.name,
        data: input.data,
      }).$returningId();

      return { id: result[0].id };
    }),

  // 获取我的记录列表
  myRecords: publicQuery
    .input(
      z.object({
        token: z.string(),
        type: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      let query = db.select().from(records)
        .where(eq(records.userId, payload.userId));

      const results = await query.orderBy(desc(records.createdAt));

      return results.map((r: any) => ({
        id: r.id,
        type: r.type,
        name: r.name,
        data: r.data,
        createdAt: r.createdAt,
      }));
    }),

  // 删除记录
  delete: publicQuery
    .input(
      z.object({
        id: z.number(),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      await db.delete(records).where(eq(records.id, input.id));

      return { ok: true };
    }),
});
