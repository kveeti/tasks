import { PrismaClient } from "@prisma/client";
import {
	eachDayOfInterval,
	eachHourOfInterval,
	endOfDay,
	endOfWeek,
	startOfDay,
	startOfWeek,
	subMinutes,
} from "date-fns";
import subWeeks from "date-fns/subWeeks";

const prisma = new PrismaClient();

const main = async () => {
	const user = await prisma.user.create({
		data: {
			email: "preview@tasks.preview",
			username: "preview",
			isAdmin: true,
		},
	});

	const tag1 = await prisma.tag.create({
		data: {
			label: "tag-1",
			color: "#01161E",
			owner: { connect: { id: user.id } },
		},
	});

	const tag2 = await prisma.tag.create({
		data: {
			label: "tag-2",
			color: "#EFF6E0",
			owner: { connect: { id: user.id } },
		},
	});

	const tag3 = await prisma.tag.create({
		data: {
			label: "tag-3",
			color: "#598392",
			owner: { connect: { id: user.id } },
		},
	});

	const week = subWeeks(new Date(), 1);
	const days = eachDayOfInterval({ start: startOfWeek(week), end: endOfWeek(week) });

	const promises = [];

	for (const day of days) {
		const times = eachHourOfInterval({ start: startOfDay(day), end: endOfDay(day) });

		for (const time of times) {
			promises.push(
				prisma.task.create({
					data: {
						owner: { connect: { id: user.id } },
						createdAt: subMinutes(time, 30),
						expiresAt: time,
						tag: { connect: { id: tag1.id } },
					},
				})
			);
		}

		times.forEach((time, i) => {
			if (i % 2 === 0) return;

			promises.push(
				prisma.task.create({
					data: {
						owner: { connect: { id: user.id } },
						createdAt: subMinutes(time, 30),
						expiresAt: time,
						tag: { connect: { id: tag2.id } },
					},
				})
			);
		});

		times.forEach((time, i) => {
			if (i % 3 !== 0) return;

			promises.push(
				prisma.task.create({
					data: {
						owner: { connect: { id: user.id } },
						createdAt: subMinutes(time, 30),
						expiresAt: time,
						tag: { connect: { id: tag3.id } },
					},
				})
			);
		});
	}

	await Promise.all(promises);
};

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);

		await prisma.$disconnect();

		process.exit(1);
	});
