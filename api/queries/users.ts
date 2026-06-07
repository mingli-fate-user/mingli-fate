import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function findUserByUsername(username: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: {
  username: string;
  nickname?: string;
  avatar?: string;
  role?: string;
}) {
  const db = await getDb();
  const values = {
    ...data,
    updatedAt: new Date(),
    role: data.role || "user",
  };

  await db
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        nickname: data.nickname,
        avatar: data.avatar,
        updatedAt: new Date(),
      },
    });
}
