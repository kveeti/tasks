import type { InferModel } from "drizzle-orm";
import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
	id: varchar("id", { length: 26 }).primaryKey(),
	email: varchar("email", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export type User = InferModel<typeof users>;

export const tags = mysqlTable("tags", {
	id: varchar("id", { length: 26 }).primaryKey(),
	label: varchar("label", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 26 })
		.notNull()
		.references(() => users.id),
	color: varchar("color", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export type Tag = InferModel<typeof tags>;

export const tasks = mysqlTable("tasks", {
	id: varchar("id", { length: 26 }).primaryKey(),
	label: varchar("label", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 26 })
		.notNull()
		.references(() => users.id),
	tagId: varchar("tag_id", { length: 26 })
		.notNull()
		.references(() => tags.id),
	createdAt: timestamp("created_at").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	stoppedAt: timestamp("stopped_at"),
});

export type Task = InferModel<typeof tasks>;

export const notifSubs = mysqlTable("notif_subs", {
	id: varchar("id", { length: 26 }).primaryKey(),
	endpoint: text("endpoint").notNull(),
	p256dh: text("p256dh").notNull(),
	auth: text("auth").notNull(),
	userId: varchar("user_id", { length: 26 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at").notNull(),
});

export type NotifSub = InferModel<typeof notifSubs>;

export const notifs = mysqlTable("notifs", {
	id: varchar("id", { length: 26 }).primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	message: varchar("message", { length: 255 }).notNull(),
	sendAt: timestamp("send_at").notNull(),
	userId: varchar("user_id", { length: 26 })
		.notNull()
		.references(() => users.id),
});

export type Notif = InferModel<typeof notifs>;
