import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { posts, comments, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./user";

export const communityRouter = createRouter({
  // 获取帖子列表
  postList: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      let query = db.select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        content: posts.content,
        category: posts.category,
        likes: posts.likes,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
      }).from(posts);

      if (input?.category) {
        query = query.where(eq(posts.category, input.category)) as typeof query;
      }

      const results = await query.orderBy(desc(posts.createdAt));

      // 获取用户信息
      const userIds = [...new Set(results.map((r: any) => r.userId))];
      const userList = userIds.length > 0
        ? await db.select().from(users)
        : [];
      const userMap = new Map<number, any>(userList.map((u: any) => [u.id, u]));

      return results.map((r: any) => ({
        ...r,
        author: userMap.get(r.userId)
          ? {
              username: userMap.get(r.userId)!.username,
              nickname: userMap.get(r.userId)!.nickname,
              avatar: userMap.get(r.userId)!.avatar,
            }
          : { username: "未知用户", nickname: "未知用户", avatar: null },
      }));
    }),

  // 创建帖子
  createPost: publicQuery
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        category: z.string().min(1),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      const result = await db.insert(posts).values({
        userId: payload.userId,
        title: input.title,
        content: input.content,
        category: input.category,
      }).$returningId();

      return { id: result[0].id };
    }),

  // 获取帖子评论
  commentList: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const results = await db.select().from(comments)
        .where(eq(comments.postId, input.postId))
        .orderBy(comments.createdAt);

      // 获取用户信息
      const userIds = [...new Set(results.map((r: any) => r.userId))];
      const userList = userIds.length > 0
        ? await db.select().from(users)
        : [];
      const userMap = new Map<number, any>(userList.map((u: any) => [u.id, u]));

      return results.map((r: any) => ({
        ...r,
        author: userMap.get(r.userId)
          ? {
              username: userMap.get(r.userId)!.username,
              nickname: userMap.get(r.userId)!.nickname,
              avatar: userMap.get(r.userId)!.avatar,
            }
          : { username: "未知用户", nickname: "未知用户", avatar: null },
      }));
    }),

  // 创建评论
  createComment: publicQuery
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.token);
      if (!payload) throw new Error("请先登录");

      const db = await getDb();
      await db.insert(comments).values({
        postId: input.postId,
        userId: payload.userId,
        content: input.content,
      });

      return { ok: true };
    }),
});
