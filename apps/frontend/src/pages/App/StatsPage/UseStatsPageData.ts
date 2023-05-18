import differenceInMinutes from "date-fns/differenceInMinutes";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import endOfMonth from "date-fns/endOfMonth";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import isSameMonth from "date-fns/isSameMonth";
import startOfMonth from "date-fns/startOfMonth";
import { useEffect, useState } from "react";

import { db } from "@/db/db";

export function useStatsPageData(date: Date):
	| {
			status: "loading" | "no-data";
			data: undefined;
	  }
	| {
			status: "data";
			data: NonNullable<Awaited<ReturnType<typeof getData>>>;
	  } {
	const [status, setStatus] = useState<"loading" | "no-data" | "data">("no-data");
	const [stateData, setStateData] = useState<Awaited<ReturnType<typeof getData>>>(undefined);

	useEffect(() => {
		(async () => {
			setStatus("loading");

			const data = await getData(date);

			if (!data) {
				setStatus("no-data");
			} else {
				setStateData(data);
				setStatus("data");
			}
		})();
	}, [date]);

	if (status === "data") {
		return { status, data: stateData! };
	} else {
		return { status, data: undefined };
	}
}

async function getData(date: Date) {
	const monthsTasks = await db.tasks
		.filter((task) => isSameMonth(date, task.createdAt))
		.toArray();

	if (!monthsTasks.length) {
		return undefined;
	}

	const monthsTags = [...new Set(monthsTasks?.map((task) => task.tag.label) ?? [])];

	const monthsDates = eachDayOfInterval({
		start: startOfMonth(date),
		end: endOfMonth(date),
	});

	const hoursPerDayData = monthsDates
		.map((d) => ({
			id: format(d, "d.M"),
			date: d,
			...monthsTags.reduce((acc, tag) => {
				acc[tag] = 0;
				return acc;
			}, {} as Record<string, number>),
		}))
		.reduce((acc, curr) => {
			const tasks = monthsTasks?.filter((task) => isSameDay(task.createdAt, curr.date));

			if (!tasks) return acc;

			tasks.forEach((task) => {
				const tag = task.tag;

				// @ts-expect-error hmm
				curr[tag.label] += task.stoppedAt
					? differenceInMinutes(task.stoppedAt, task.createdAt)
					: differenceInMinutes(task.expiresAt, task.createdAt);
			});

			// @ts-expect-error hmm
			acc.push(curr);

			return acc;
		}, [] as Record<string, number>[]);

	const yMax = Math.max(
		...hoursPerDayData.map((d) => {
			const daysTotal = Object.values(d)
				.map((v) => (typeof v === "number" ? v : 0))
				.reduce((acc, curr) => curr + acc, 0);

			return daysTotal;
		})
	);

	const yHalf = Number((yMax / 2).toFixed(0));
	const yAxisValues = [0, yHalf / 2, yHalf, yHalf + yHalf / 2, yMax];

	const xHalf = monthsDates.length / 2;
	const xFormatted = monthsDates.map((d) => format(d, "d.M"));
	const xAxisValues = [
		xFormatted.at(0),
		xFormatted.at(xHalf / 2),
		xFormatted.at(xHalf),
		xFormatted.at(xHalf + xHalf / 2),
		xFormatted.at(-1),
	];

	const tagDistributionData = monthsTasks?.reduce((acc, task) => {
		const tag = task.tag;

		const tagIndex = acc.findIndex((tag) => tag.id === task.tag.id);

		const currentTaskMinutes = task.stoppedAt
			? differenceInMinutes(task.stoppedAt, task.createdAt)
			: differenceInMinutes(task.expiresAt, task.createdAt);

		if (tagIndex === -1) {
			acc.push({
				id: tag.id,
				label: tag.label,
				value: currentTaskMinutes,
			});
		} else {
			acc[tagIndex]!.value += currentTaskMinutes;
		}

		return acc;
	}, [] as { id: string; label: string; value: number }[]);

	return {
		hoursPerDayData: {
			data: hoursPerDayData,
			xAxisValues,
			yAxisValues,
		},
		monthsTags,
		tagDistributionData,
	};
}

export type StatsPageData = Awaited<ReturnType<typeof getData>>;
