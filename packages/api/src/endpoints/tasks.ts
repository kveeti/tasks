import { createInsertSchema } from "drizzle-zod";

import { tasks } from "@tasks/data";

import { protectedProcedure, router } from "../trpc";

export const tasksEndpoints = router({
	add: protectedProcedure
		.input(createInsertSchema(tasks).omit({ ogCreatedAt: true, userId: true }))
		.mutation(async ({ ctx, input }) => {
			const task = {
				id: input.id,
				tagId: input.tagId ? input.tagId : null,
				userId: ctx.userId,
				expiresAt: input.expiresAt,
				stoppedAt: input.stoppedAt ? input.stoppedAt : null,
				updatedAt: input.updatedAt,
				ogCreatedAt: input.createdAt,
				createdAt: new Date(),
			};

			await ctx.db.insert(tasks).values(task);
		}),
});
