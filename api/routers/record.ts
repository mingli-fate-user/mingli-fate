import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { records } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./user";

export const recordRouter = createRouter({
  save: publicQuery
    .input(z.object({
      type: z.string(),
      title: z.string(),
      data: z.record(z.any()),
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      const result = await db.insert(records).values({
        userId: payload.userId,
        type: input.type,
        title: input.title,
        data: input.data,
      }).returning({ id: records.id });

      return { id: result[0].id };
    }),

  myRecords: publicQuery
    .input(z.object({ token: z.string(), type: z.string().optional() }))
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) return [];

      const db = getDb();
      let query = db.select().from(records).where(eq(records.userId, payload.userId));
      if (input.type) {
        query = query.where(eq(records.type, input.type));
      }
      return query.orderBy(desc(records.createdAt));
    }),

  delete: publicQuery
    .input(z.object({ id: z.number(), token: z.string() }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      await db.delete(records).where(eq(records.id, input.id));
      return { ok: true };
    }),
});
