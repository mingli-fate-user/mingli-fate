import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { aiChats } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./user";

export const aiChatRouter = createRouter({
  save: publicQuery
    .input(z.object({
      toolType: z.string(),
      recordId: z.number().optional(),
      messages: z.array(z.any()),
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      const result = await db.insert(aiChats).values({
        userId: payload.userId,
        toolType: input.toolType,
        recordId: input.recordId || null,
        messages: input.messages,
      }).returning({ id: aiChats.id });

      return { id: result[0].id };
    }),

  myChats: publicQuery
    .input(z.object({ toolType: z.string().optional(), token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) return [];

      const db = getDb();
      let query = db.select().from(aiChats).where(eq(aiChats.userId, payload.userId));
      if (input.toolType) {
        query = query.where(eq(aiChats.toolType, input.toolType));
      }
      return query.orderBy(desc(aiChats.createdAt));
    }),

  delete: publicQuery
    .input(z.object({ id: z.number(), token: z.string() }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      await db.delete(aiChats).where(eq(aiChats.id, input.id));
      return { ok: true };
    }),
});
