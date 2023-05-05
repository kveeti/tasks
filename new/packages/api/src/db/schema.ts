import type { InferModel } from "drizzle-orm";
import { boolean, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
	id: varchar("id", { length: 36 }).primaryKey(),
	email: varchar("email", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export type User = InferModel<typeof users>;
