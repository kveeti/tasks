import differenceInMilliseconds from "date-fns/differenceInMilliseconds";
import { and, eq } from "drizzle-orm";
import webpush from "web-push";
import { z } from "zod";

import { type Notif, createId, notifSubs, notifs } from "@tasks/data";

import { env } from "../env";
import { protectedProcedure, router } from "../trpc";

const activeNotifs = new Map<string, NodeJS.Timeout>();

webpush.setVapidDetails("mailto:veeti@veetik.com", env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

export const notifsEndpoints = router({
	addSub: protectedProcedure
		.input(
			z.object({
				endpoint: z.string(),
				p256dh: z.string(),
				auth: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			console.log("addSub");

			await ctx.db.insert(notifSubs).values({
				id: createId(),
				userId: ctx.userId,
				p256dh: input.p256dh,
				endpoint: input.endpoint,
				auth: input.auth,
				createdAt: new Date(),
			});

			console.log("addSub complete");
		}),

	addNotif: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				message: z.string(),
				sendAt: z.date(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			console.log("addNotif");

			const notif: Notif = {
				id: createId(),
				userId: ctx.userId,
				title: input.title,
				message: input.message,
				sendAt: input.sendAt,
			};

			await ctx.db.insert(notifs).values(notif);

			const timeout = setTimeout(async () => {
				const dbNotifSubs = await ctx.db
					.select()
					.from(notifSubs)
					.where(eq(notifSubs.userId, ctx.userId));

				for (const notifSub of dbNotifSubs) {
					console.log("sending notification to", notifSub);

					webpush
						.sendNotification(
							{
								endpoint: notifSub.endpoint,
								keys: {
									auth: notifSub.auth,
									p256dh: notifSub.p256dh,
								},
							},
							JSON.stringify({
								type: "NOTIFICATION",
								payload: { title: input.title, message: input.message },
							})
						)
						.catch((err) => console.log(err));
				}
			}, differenceInMilliseconds(input.sendAt, new Date()));

			activeNotifs.set(notif.id, timeout);
		}),

	cancelNotif: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(notifs)
				.where(and(eq(notifs.id, input.id), eq(notifs.userId, ctx.userId)));
		}),
});
