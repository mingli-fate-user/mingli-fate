import { createRouter, publicQuery } from "./middleware";
import { userRouter } from "./routers/user";
import { communityRouter } from "./routers/community";
import { recordRouter } from "./routers/record";
import { apiKeyRouter } from "./routers/apiKey";
import { aiChatRouter } from "./routers/aiChat";
import { mianxiangRouter } from "./routers/mianxiang";
import { authRouter } from "./auth-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,

  user: userRouter,
  community: communityRouter,
  record: recordRouter,
  apiKey: apiKeyRouter,
  aiChat: aiChatRouter,
  mianxiang: mianxiangRouter,
});

export type AppRouter = typeof appRouter;
