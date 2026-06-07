import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { posts, comments, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./user";

export const communityRouter = createRouter({
  createPost: publicQuery
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      category: z.string().optional(),
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      const result = await db.insert(posts).values({
        userId: payload.userId,
        title: input.title,
        content: input.content,
        category: input.category || "其他",
      }).returning({ id: posts.id });

      return { id: result[0].id };
    }),

  listPosts: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      let query = db.select().from(posts);
      if (input?.category) {
        query = query.where(eq(posts.category, input.category));
      }
      const results = await query.orderBy(desc(posts.createdAt));

      // 获取用户信息
      const userIds = [...new Set(results.map((r: any) => r.userId))];
      const allUsers = userIds.length > 0 ? await db.select().from(users) : [];
      const userMap = new Map<number, any>(allUsers.filter((u: any) => userIds.includes(u.id)).map((u: any) => [u.id, u]));

      return results.map((r: any) => ({
        ...r,
        author: userMap.get(r.userId)
          ? { username: userMap.get(r.userId).username, nickname: userMap.get(r.userId).nickname, avatar: userMap.get(r.userId).avatar }
          : { username: "未知用户", nickname: "未知用户", avatar: null },
      }));
    }),

  myPosts: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) return [];

      const db = getDb();
      return db.select().from(posts)
        .where(eq(posts.userId, payload.userId))
        .orderBy(desc(posts.createdAt));
    }),

  createComment: publicQuery
    .input(z.object({
      postId: z.number(),
      content: z.string().min(1),
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = getDb();
      await db.insert(comments).values({
        postId: input.postId,
        userId: payload.userId,
        content: input.content,
      });
      return { ok: true };
    }),

  listComments: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(comments)
        .where(eq(comments.postId, input.postId))
        .orderBy(desc(comments.createdAt));

      // 获取用户信息
      const userIds = [...new Set(results.map((r: any) => r.userId))];
      const allUsers = userIds.length > 0 ? await db.select().from(users) : [];
      const userMap = new Map<number, any>(allUsers.filter((u: any) => userIds.includes(u.id)).map((u: any) => [u.id, u]));

      return results.map((r: any) => ({
        ...r,
        author: userMap.get(r.userId)
          ? { username: userMap.get(r.userId).username, nickname: userMap.get(r.userId).nickname, avatar: userMap.get(r.userId).avatar }
          : { username: "未知用户", nickname: "未知用户", avatar: null },
      }));
    }),
});
