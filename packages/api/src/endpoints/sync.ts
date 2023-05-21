import { and, eq, gte, or, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { type Tag, type Task, tags, tasks } from "@tasks/data";

import { protectedProcedure, router } from "../trpc";

export const syncEndpoints = router({
	sync: protectedProcedure
		.input(
			z.object({
				lastSyncedAt: z.date().nullable(),
				tasks: z.array(createInsertSchema(tasks).omit({ ogCreatedAt: true, userId: true })),
				tags: z.array(createInsertSchema(tags).omit({ ogCreatedAt: true, userId: true })),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const tagsToUpsert: Tag[] = input.tags.map((tag) => ({
				id: tag.id,
				userId: ctx.userId,
				label: tag.label,
				createdAt: new Date(),
				ogCreatedAt: tag.createdAt,
				updatedAt: new Date(),
			}));

			const tasksToUpsert: Task[] = input.tasks.map((task) => ({
				id: task.id,
				tagId: task.tagId ? task.tagId : null,
				userId: ctx.userId,
				expiresAt: task.expiresAt,
				stoppedAt: task.stoppedAt ? task.stoppedAt : null,
				createdAt: new Date(),
				ogCreatedAt: task.createdAt,
				updatedAt: new Date(),
			}));

			if (tagsToUpsert.length) {
				console.log("Inserting", tagsToUpsert.length, "tags");

				await ctx.db
					.insert(tags)
					.values(tagsToUpsert)
					.onDuplicateKeyUpdate({
						set: {
							label: sql`tags.label`,
							updatedAt: sql`tags.updated_at`,
						},
					});
			}

			if (tasksToUpsert.length) {
				console.log("Inserting", tasksToUpsert.length, "tasks");

				await ctx.db
					.insert(tasks)
					.values(tasksToUpsert)
					.onDuplicateKeyUpdate({
						set: {
							tagId: sql`tasks.tag_id`,
							expiresAt: sql`tasks.expires_at`,
							stoppedAt: sql`tasks.stopped_at`,
							updatedAt: sql`tasks.updated_at`,
						},
					});
			}

			const tagsOutOfDateOnClient = await ctx.db
				.select()
				.from(tags)
				.where(
					and(
						eq(tags.userId, ctx.userId),
						input.lastSyncedAt
							? or(
									input.lastSyncedAt
										? gte(tags.ogCreatedAt, input.lastSyncedAt)
										: undefined,
									input.lastSyncedAt
										? gte(tags.updatedAt, input.lastSyncedAt)
										: undefined
							  )
							: undefined
					)
				);

			const tasksOutOfDateOnClient = await ctx.db
				.select()
				.from(tasks)
				.where(
					and(
						eq(tasks.userId, ctx.userId),
						input.lastSyncedAt
							? or(
									input.lastSyncedAt
										? gte(tasks.ogCreatedAt, input.lastSyncedAt)
										: undefined,
									input.lastSyncedAt
										? gte(tasks.updatedAt, input.lastSyncedAt)
										: undefined
							  )
							: undefined
					)
				);

			return {
				tags: tagsOutOfDateOnClient.map((t) => ({
					id: t.id,
					label: t.label,
					createdAt: t.ogCreatedAt,
					updatedAt: t.updatedAt,
				})),
				tasks: tasksOutOfDateOnClient.map((t) => ({
					id: t.id,
					tagId: t.tagId,
					createdAt: t.ogCreatedAt,
					updatedAt: t.updatedAt,
					expiresAt: t.expiresAt,
					stoppedAt: t.stoppedAt,
				})),
			};
		}),
});
