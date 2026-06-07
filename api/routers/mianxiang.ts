import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { mianxiangRecords } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./user";

export const mianxiangRouter = createRouter({
  save: publicQuery
    .input(z.object({
      mode: z.string(),
      messages: z.array(z.any()),
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      const result = await db.insert(mianxiangRecords).values({
        userId: payload.userId,
        mode: input.mode,
        messages: input.messages,
      }).returning({ id: mianxiangRecords.id });

      return { id: result[0].id };
    }),

  myRecords: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) return [];

      const db = getDb();
      return db.select().from(mianxiangRecords)
        .where(eq(mianxiangRecords.userId, payload.userId))
        .orderBy(desc(mianxiangRecords.createdAt));
    }),

  delete: publicQuery
    .input(z.object({ id: z.number(), token: z.string() }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      await db.delete(mianxiangRecords).where(eq(mianxiangRecords.id, input.id));
      return { ok: true };
    }),
});
