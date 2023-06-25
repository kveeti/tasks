import { LogActorType, LogType } from "@prisma/client";
import { z } from "zod";

import { adminProcedure, router } from "../trpc";

const LogActorTypes = [...[...Object.entries(LogActorType)].map(([_k, v]) => v), "all"];
const logTypes = [...[...Object.entries(LogType)].map(([_k, v]) => v), "all"];

export const adminRouter = router({
	/**
	 * GET LOGS
	 */
	getLogs: adminProcedure
		.input(
			z.object({
				logType: z
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					.enum([logTypes.at(0)!, ...logTypes.slice(1)!])
					.transform((v) => (v === "all" ? undefined : (v as LogType)))
					.optional(),
				targetType: z
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					.enum([LogActorTypes.at(0)!, ...LogActorTypes.slice(1)!])
					.transform((v) => (v === "all" ? undefined : (v as LogActorType)))
					.optional(),
				executorId: z.string().optional(),
				targetId: z.string().optional(),
				targetOwnerId: z.string().optional(),
				between: z
					.object({
						from: z.date(),
						to: z.date(),
					})
					.optional(),
				afterId: z.string().optional(),
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 100;
			const cursor = input.cursor ?? undefined;

			console.log(input);

			const logs = await ctx.prisma.log.findMany({
				include: { actors: true },
				where: {
					...(input.between && {
						createdAt: { gte: input.between.from, lte: input.between.to },
					}),
					...(input.logType && { logType: input.logType }),
					...(input.executorId && {
						actors: { some: { sequenceType: "Executor", actorId: input.executorId } },
					}),
					...(input.targetId && {
						actors: { some: { sequenceType: "Target", actorId: input.targetId } },
					}),
					...(input.targetOwnerId && {
						actors: {
							some: { sequenceType: "TargetOwner", actorId: input.targetOwnerId },
						},
					}),
					...(input.targetType && {
						actors: { some: { actorType: input.targetType, sequenceType: "Target" } },
					}),
				},
				orderBy: { id: "asc" },
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				skip: 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;
			if (logs.length > limit) {
				const nextItem = logs.pop();
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				nextCursor = nextItem!.id;
			}

			return {
				logs,
				nextCursor,
			};
		}),
});
