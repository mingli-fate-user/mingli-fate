import { relations } from "drizzle-orm";
import { users, apiKeys, aiChats, records, mianxiangRecords } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  apiKeys: many(apiKeys),
  records: many(records),
  aiChats: many(aiChats),
  mianxiangRecords: many(mianxiangRecords),
}));
