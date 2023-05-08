import { TRPCError } from "@trpc/server";
import {
	addSeconds,
	differenceInMinutes,
	eachDayOfInterval,
	eachWeekOfInterval,
	endOfMonth,
	endOfWeek,
	isSameDay,
	isSameWeek,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { z } from "zod";

import { v } from "~validation";

import { protectedProcedure, router } from "../trpc";

export const meRouter = router({
	/**
	 * GET ME
	 */
	getMe: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.prisma.user.findUnique({
			where: { id: ctx.userId },
			include: { ownedTags: true, ownedTasks: true },
		});

		const currentTime = new Date();

		return {
			...user,
			ownedTasks: user?.ownedTasks.map((task) => {
				const isActive =
					!task.stoppedAt &&
					task.createdAt <= currentTime &&
					task.expiresAt > currentTime;

				return {
					...task,
					isActive,
				};
			}),
		};
	}),

	/**
	 * UPDATE ME
	 */
	updateMe: protectedProcedure.input(v.me.updateMe.form).mutation(async ({ ctx, input }) => {
		const userId = ctx.userId;

		return await ctx.prisma.$transaction(async (tx) => {
			const updatedUser = await tx.user.update({
				where: { id: userId },
				data: { username: input.username },
			});

			await tx.log.create({
				data: {
					logType: "UpdateUser",
					actors: {
						createMany: {
							data: [
								{
									sequenceType: "Executor",
									actorType: "User",
									actorId: userId,
								},
								{
									sequenceType: "Target",
									actorType: "User",
									actorId: userId,
								},
							],
						},
					},
				},
			});

			return updatedUser;
		});
	}),

	/**
	 * DELETE ME
	 */
	deleteMe: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.userId;

		await ctx.prisma.$transaction(async (tx) => {
			await tx.user.delete({ where: { id: userId } });

			await tx.log.create({
				data: {
					logType: "DeleteUser",
					actors: {
						createMany: {
							data: [
								{ sequenceType: "Executor", actorType: "User", actorId: userId },
								{ sequenceType: "Target", actorType: "User", actorId: userId },
							],
						},
					},
				},
			});
		});
	}),

	/**
	 * TAGS
	 */
	tags: router({
		/**
		 * GET TAGS
		 */
		getAll: protectedProcedure.query(async ({ ctx }) => {
			return await ctx.prisma.tag.findMany({
				where: { ownerId: ctx.userId },
			});
		}),

		/**
		 * CREATE TAG
		 */
		createTag: protectedProcedure
			.input(v.me.tags.createTag.input)
			.mutation(async ({ ctx, input }) => {
				const collidingTag = await ctx.prisma.tag.findFirst({
					where: { label: input.label, ownerId: ctx.userId },
				});

				if (collidingTag) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `You already have a tag with the label "${input.label}"`,
					});
				}

				return await ctx.prisma.$transaction(async (tx) => {
					const createdTag = await tx.tag.create({
						data: {
							label: input.label,
							color: input.color,
							owner: { connect: { id: ctx.userId } },
						},
					});

					await tx.log.create({
						data: {
							logType: "CreateTag",
							actors: {
								createMany: {
									data: [
										{
											sequenceType: "Executor",
											actorType: "User",
											actorId: ctx.userId,
										},
										{
											sequenceType: "Target",
											actorType: "Tag",
											actorId: createdTag.id,
										},
										{
											sequenceType: "TargetOwner",
											actorType: "User",
											actorId: ctx.userId,
										},
									],
								},
							},
						},
					});

					return createdTag;
				});
			}),

		/**
		 * UPDATE TAG
		 */
		updateTag: protectedProcedure
			.input(v.me.tags.updateTag.input)
			.mutation(async ({ ctx, input }) => {
				const tagToUpdate = await ctx.prisma.tag.findFirst({
					where: { id: input.tagId, ownerId: ctx.userId },
				});

				if (!tagToUpdate) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Tag doesn't exist",
					});
				}

				// check for tags with same label, if label is being updated
				if (input.label !== tagToUpdate.label) {
					const collidingTag = await ctx.prisma.tag.findFirst({
						where: { label: input.label, ownerId: ctx.userId },
					});

					if (collidingTag) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: `You already have a tag with the label "${input.label}"`,
						});
					}
				}

				return await ctx.prisma.$transaction(async (tx) => {
					const updatedTag = await tx.tag.update({
						where: { id: input.tagId },
						data: { label: input.label, color: input.color },
					});

					await tx.log.create({
						data: {
							logType: "UpdateTag",
							actors: {
								createMany: {
									data: [
										{
											sequenceType: "Executor",
											actorType: "User",
											actorId: ctx.userId,
										},
										{
											sequenceType: "Target",
											actorType: "Tag",
											actorId: input.tagId,
										},
										{
											sequenceType: "TargetOwner",
											actorType: "User",
											actorId: ctx.userId,
										},
									],
								},
							},
						},
					});

					return updatedTag;
				});
			}),
		/**
		 * DELETE TAG
		 */
		deleteTag: protectedProcedure
			.input(v.me.tags.deleteTag.input)
			.mutation(async ({ ctx, input }) => {
				return await ctx.prisma.$transaction(async (tx) => {
					const tagToDelete = await tx.tag.findFirst({
						where: { id: input.tagId, ownerId: ctx.userId },
					});

					if (!tagToDelete) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: "Tag doesn't exist",
						});
					}

					await tx.tag.deleteMany({ where: { id: input.tagId, ownerId: ctx.userId } });

					await tx.log.create({
						data: {
							logType: "DeleteTag",
							actors: {
								createMany: {
									data: [
										{
											sequenceType: "Executor",
											actorType: "User",
											actorId: ctx.userId,
										},
										{
											sequenceType: "Target",
											actorType: "Tag",
											actorId: input.tagId,
										},
										{
											sequenceType: "TargetOwner",
											actorType: "User",
											actorId: ctx.userId,
										},
									],
								},
							},
						},
					});
				});
			}),
	}),

	/**
	 * TASKS
	 */
	tasks: router({
		/**
		 * CREATE TASK
		 */
		createTask: protectedProcedure
			.input(v.me.tasks.createTask.input)
			.mutation(async ({ ctx, input }) => {
				const userId = ctx.userId;
				const currentTime = new Date();

				const activeTask = await ctx.prisma.task.findFirst({
					where: {
						ownerId: userId,
						OR: [
							{
								stoppedAt: null,
								createdAt: { lte: currentTime },
								expiresAt: { gte: currentTime },
							},
						],
					},
				});

				if (activeTask) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "You already have an active task.",
					});
				}

				return await ctx.prisma.$transaction(async (tx) => {
					const createdTask = await tx.task.create({
						data: {
							expiresAt: addSeconds(new Date(), input.expires_after),
							tag: { connect: { id: input.tagId } },
							owner: { connect: { id: userId } },
						},
					});

					await tx.log.create({
						data: {
							logType: "CreateTask",
							actors: {
								createMany: {
									data: [
										{
											sequenceType: "Executor",
											actorType: "User",
											actorId: userId,
										},
										{
											sequenceType: "Target",
											actorType: "Task",
											actorId: createdTask.id,
										},
										{
											sequenceType: "TargetOwner",
											actorType: "User",
											actorId: userId,
										},
									],
								},
							},
						},
					});

					return createdTask;
				});
			}),

		/**
		 * STOP TASK
		 */
		stopTask: protectedProcedure.mutation(async ({ ctx }) => {
			const userId = ctx.userId;
			const currentTime = new Date();

			const runningTask = await ctx.prisma.task.findFirst({
				where: {
					ownerId: userId,
					OR: [
						{
							stoppedAt: null,
							createdAt: { lte: currentTime },
							expiresAt: { gte: currentTime },
						},
					],
				},
			});

			if (!runningTask) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You don't have an active task.",
				});
			}

			return await ctx.prisma.$transaction(async (tx) => {
				const stoppedTask = await tx.task.update({
					where: { id: runningTask.id },
					data: { stoppedAt: new Date() },
				});

				await tx.log.create({
					data: {
						logType: "StopTask",
						actors: {
							createMany: {
								data: [
									{
										sequenceType: "Executor",
										actorType: "User",
										actorId: userId,
									},
									{
										sequenceType: "Target",
										actorType: "Task",
										actorId: stoppedTask.id,
									},
									{
										sequenceType: "TargetOwner",
										actorType: "User",
										actorId: userId,
									},
								],
							},
						},
					},
				});

				return stoppedTask;
			});
		}),
	}),

	/**
	 * STATS
	 */
	stats: router({
		/**
		 * WEEKLY
		 */
		weekly: protectedProcedure
			.input(z.object({ week: z.date() }))
			.query(async ({ ctx, input }) => {
				const start = startOfWeek(input.week, { weekStartsOn: 1 });
				const end = endOfWeek(start, { weekStartsOn: 1 });

				const [weeklyTasks, tags] = await ctx.prisma.$transaction([
					ctx.prisma.task.findMany({
						where: {
							ownerId: ctx.userId,
							createdAt: { gte: start, lte: end },
						},
						include: { tag: true },
					}),
					ctx.prisma.tag.findMany({
						where: { ownerId: ctx.userId },
					}),
				]);

				const days = eachDayOfInterval({ start, end });

				const weeklyStats = days.map((day) => {
					const tasks = weeklyTasks.filter((task) => isSameDay(task.createdAt, day));

					const tagMinutes = tags.map((tag) => {
						const currentTime = new Date();
						const completedTagTasks = tasks.filter(
							(task) =>
								task.tagId === tag.id &&
								(task.stoppedAt || task.expiresAt < currentTime)
						);

						const minutes = completedTagTasks.reduce((acc, task) => {
							const taskMinutes = differenceInMinutes(
								task.stoppedAt ?? task.expiresAt,
								task.createdAt,
								{ roundingMethod: "round" }
							);

							return acc + taskMinutes;
						}, 0);

						return { tag, minutes };
					});

					const totalMinutes = tagMinutes.reduce(
						(acc, tagHour) => acc + tagHour.minutes,
						0
					);

					return {
						date: day,
						tagMinutes,
						totalMinutes,
					};
				});

				const totalMinutes = weeklyStats.reduce((acc, day) => acc + day.totalMinutes, 0);

				const weeklyTotalMinutesPerTag = tags.map((tag) => {
					const minutes = weeklyStats.reduce((acc, day) => {
						const tagMinutes =
							day.tagMinutes.find((tagMinute) => tagMinute.tag.id === tag.id)
								?.minutes ?? 0;

						return acc + tagMinutes;
					}, 0);

					return { tag, minutes };
				});

				return {
					hasData: totalMinutes > 0,
					weeklyStats,
					weeklyTotalMinutesPerTag,
				};
			}),

		/**
		 * MONTHLY
		 */
		monthly: protectedProcedure
			.input(z.object({ week: z.date() }))
			.query(async ({ ctx, input }) => {
				const start = startOfMonth(input.week);
				const end = endOfMonth(input.week);

				const [weeklyTasks, tags] = await ctx.prisma.$transaction([
					ctx.prisma.task.findMany({
						where: {
							ownerId: ctx.userId,
							createdAt: { gte: start, lte: end },
						},
						include: { tag: true },
					}),
					ctx.prisma.tag.findMany({
						where: { ownerId: ctx.userId },
					}),
				]);

				const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
				const currentTime = new Date();

				const monthlyStats = weeks.map((week) => {
					const completedTasks = weeklyTasks.filter(
						(task) =>
							isSameWeek(task.createdAt, week, { weekStartsOn: 1 }) &&
							(task.stoppedAt || task.expiresAt < currentTime)
					);

					const tagMinutes = tags.map((tag) => {
						const tagTasks = completedTasks.filter((task) => task.tagId === tag.id);

						const minutes = tagTasks.reduce((acc, task) => {
							const taskMinutes = differenceInMinutes(
								task.stoppedAt ?? task.expiresAt,
								task.createdAt,
								{ roundingMethod: "round" }
							);

							return acc + taskMinutes;
						}, 0);

						return { tag, minutes };
					});

					const totalMinutes = tagMinutes.reduce(
						(acc, tagHour) => acc + tagHour.minutes,
						0
					);

					return {
						week,
						tagMinutes,
						totalMinutes,
					};
				});

				const totalMinutes = monthlyStats.reduce((acc, week) => acc + week.totalMinutes, 0);

				const monthlyTotalMinutesPerTag = tags.map((tag) => {
					const minutes = monthlyStats.reduce((acc, week) => {
						const tagMinutes =
							week.tagMinutes.find((tagMinute) => tagMinute.tag.id === tag.id)
								?.minutes ?? 0;

						return acc + tagMinutes;
					}, 0);

					return { tag, minutes };
				});

				return {
					hasData: totalMinutes > 0,
					monthlyStats,
					monthlyTotalMinutesPerTag,
				};
			}),
	}),
});
