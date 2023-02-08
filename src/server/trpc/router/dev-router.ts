import { addHours, eachDayOfInterval, subDays } from "date-fns";

import { devProcedure, router } from "../trpc";

export const devRouter = router({
	addTasks: devProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.userId;
		const currentTime = new Date();

		const lastWeeksDays = eachDayOfInterval({
			start: subDays(currentTime, 7),
			end: currentTime,
		});

		const tag =
			(await ctx.prisma.tag.findFirst({
				where: { ownerId: userId },
			})) ??
			(await ctx.prisma.tag.create({
				data: {
					ownerId: userId,
					label: "Test tag",
					color: "#000000",
				},
			}));

		await ctx.prisma.task.createMany({
			data: lastWeeksDays.map((date) => ({
				ownerId: userId,
				tagId: tag.id,
				stoppedAt: addHours(date, 1.8),
				expiresAt: addHours(date, 2),
				createdAt: date,
			})),
		});
	}),

	deleteTasks: devProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.userId;

		await ctx.prisma.task.deleteMany({
			where: { ownerId: userId },
		});
	}),
});
