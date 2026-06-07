import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { aiChats } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./user";

export const aiChatRouter = createRouter({
  // 保存AI聊天记录
  save: publicQuery
    .input(
      z.object({
        toolType: z.string(),
        recordId: z.number().optional(),
        messages: z.array(z.any()),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      const result = await db.insert(aiChats).values({
        userId: payload.userId,
        toolType: input.toolType,
        recordId: input.recordId || null,
        messages: input.messages,
      }).$returningId();

      return { id: result[0].id };
    }),

  // 获取某工具的AI聊天记录
  myChats: publicQuery
    .input(
      z.object({
        toolType: z.string().optional(),
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) return [];

      const db = await getDb();
      let query = db.select().from(aiChats)
        .where(eq(aiChats.userId, payload.userId));

      const results = await query.orderBy(desc(aiChats.createdAt));

      return results.map((r: any) => ({
        id: r.id,
        toolType: r.toolType,
        recordId: r.recordId,
        messages: r.messages,
        createdAt: r.createdAt,
      }));
    }),

  // 删除AI聊天记录
  delete: publicQuery
    .input(z.object({ id: z.number(), token: z.string() }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      await db.delete(aiChats).where(eq(aiChats.id, input.id));
      return { ok: true };
    }),
});
