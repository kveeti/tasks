import * as d3 from "d3";
import differenceInHours from "date-fns/differenceInHours";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import endOfDay from "date-fns/endOfDay";
import endOfMonth from "date-fns/endOfMonth";
import endOfWeek from "date-fns/endOfWeek";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import startOfMonth from "date-fns/startOfMonth";
import startOfWeek from "date-fns/startOfWeek";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment } from "react";
import useMeasure from "react-use-measure";

import { db } from "@/db/db";

export function HoursPerDayChart(props: { selectedDate: Date; timeframe: "month" | "week" }) {
	const [ref, bounds] = useMeasure();

	const start =
		props.timeframe === "week"
			? startOfWeek(props.selectedDate, { weekStartsOn: 1 })
			: startOfMonth(props.selectedDate);
	const end =
		props.timeframe === "week"
			? endOfWeek(props.selectedDate, { weekStartsOn: 1 })
			: endOfMonth(props.selectedDate);

	return (
		<>
			<h2 className="text-lg font-bold">hours per day</h2>

			<div className="my-2 border-b border-b-gray-800" />

			<div ref={ref} className="h-[180px]">
				<Chart
					height={bounds.height}
					width={bounds.width}
					selectedDate={props.selectedDate}
					timeframe={props.timeframe}
					start={start}
					end={end}
				/>
			</div>
		</>
	);
}

function Chart(props: {
	width: number;
	height: number;
	selectedDate: Date;
	timeframe: "month" | "week";
	start: Date;
	end: Date;
}) {
	const dbTasks = useLiveQuery(
		() =>
			db.tasks
				.filter(
					(t) =>
						!t.deleted_at &&
						(!!t.stopped_at || !!t.expires_at) &&
						t.started_at >= props.start &&
						t.started_at <= props.end
				)
				.toArray(),
		[props.selectedDate, props.start, props.end, props.timeframe]
	);

	if (!dbTasks?.length) {
		return <div>no data</div>;
	}

	const data = eachDayOfInterval({
		start: props.start,
		end: props.end,
	}).reduce((acc, cur) => {
		const daysTasks = dbTasks?.filter((d) => isSameDay(d.started_at, cur));

		const daysTotalHours =
			daysTasks.reduce(
				(acc, cur) =>
					acc + +differenceInHours(cur.stopped_at ?? cur.expires_at, cur.started_at),
				0
			) || 0;

		acc.push({
			date: cur,
			dateLabel: format(cur, "d.M"),
			hours: daysTotalHours,
		});

		return acc;
	}, [] as { date: Date; dateLabel: string; hours: number }[]);

	const margin = {
		top: 10,
		bottom: 20,
		right: 15,
		left: 25,
	};

	const dates = data.map((d) => d.date);

	const datesToShow =
		props.timeframe === "week"
			? dates
			: ([
					dates.at(0),
					dates.at(Math.ceil(dates.length / 4) - 1),
					dates.at(Math.ceil(dates.length / 2) - 1),
					dates.at(Math.ceil((dates.length / 4) * 3) - 1),
					dates.at(-1),
			  ] as Date[]);

	const x = d3
		.scaleTime()
		.domain([props.start, props.end])
		.range([margin.left, props.width - margin.right]);

	const yMax = d3.max(data, (d) => d.hours) ?? 0;

	const y = d3
		.scaleLinear()
		.domain([0, yMax > 25 ? yMax : 25])
		.range([props.height - margin.bottom, margin.top]);

	return (
		<svg viewBox={`0 0 ${props.width} ${props.height}`}>
			{/* X axis dates */}
			{datesToShow.map((date) => (
				<g key={date.toISOString()} transform={`translate(${x(date)}, 0)`}>
					<text
						className="text-[12px] text-gray-400"
						x={(x(endOfDay(date)) - x(date)) / 2}
						y={props.height - 5}
						fill="currentColor"
						textAnchor="middle"
					>
						{props.timeframe === "week"
							? format(date, "EEE").toLowerCase()
							: format(date, "d.M")}
					</text>
				</g>
			))}

			{/* Y axis ticks */}
			{y.ticks(4).map((yTick) => (
				<g key={yTick} transform={`translate(0, ${y(yTick)})`}>
					<line
						x1={margin.left}
						x2={props.width - margin.right}
						stroke="currentColor"
						strokeDasharray="1,3"
						className="text-gray-700"
					/>
					<text
						className="text-[12px] text-gray-400"
						fill="currentColor"
						alignmentBaseline="middle"
					>
						{yTick}
					</text>
				</g>
			))}

			{/* Bars */}
			{data.map((d, i) => (
				<g key={d.date.toISOString()} transform={`translate(${x(d.date)}, ${y(d.hours)})`}>
					<rect
						width={x(endOfDay(d.date)) - x(d.date)}
						height={y(0) - y(d.hours)}
						rx={2.5}
						fill="currentColor"
						className="text-gray-300"
					/>
				</g>
			))}
		</svg>
	);
}
