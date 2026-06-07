import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function findUserByUsername(username: string) {
  const db = getDb();
  const rows = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
  return rows.at(0);
}

export async function upsertUser(data: {
  username: string;
  nickname?: string;
  avatar?: string;
  role?: string;
}) {
  const db = getDb();
  const existing = await findUserByUsername(data.username);
  if (existing) {
    await db.update(schema.users).set({
      nickname: data.nickname,
      avatar: data.avatar,
      updatedAt: new Date(),
    }).where(eq(schema.users.id, existing.id));
  } else {
    await db.insert(schema.users).values({
      username: data.username,
      passwordHash: "",
      nickname: data.nickname,
      avatar: data.avatar,
      role: data.role || "user",
    });
  }
}
