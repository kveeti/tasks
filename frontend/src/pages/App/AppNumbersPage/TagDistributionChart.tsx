import * as d3 from "d3";
import differenceInSeconds from "date-fns/differenceInSeconds";
import endOfMonth from "date-fns/endOfMonth";
import endOfWeek from "date-fns/endOfWeek";
import endOfYear from "date-fns/endOfYear";
import secondsToHours from "date-fns/secondsToHours";
import startOfMonth from "date-fns/startOfMonth";
import startOfWeek from "date-fns/startOfWeek";
import startOfYear from "date-fns/startOfYear";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment } from "react";
import useMeasure from "react-use-measure";

import { type DbTag, db } from "@/db/db";
import { useDbTags } from "@/db/useCommonDb";

export function TagDistributionChart(props: {
	selectedDate: Date;
	timeframe: "year" | "month" | "week";
}) {
	const [ref, bounds] = useMeasure();

	const data = useData({
		selectedDate: props.selectedDate,
		timeframe: props.timeframe,
	});

	return (
		<>
			<h2 className="text-lg font-bold">tag distribution</h2>

			<div className="mb-4 mt-2 border-b border-b-gray-800/70" />

			<div ref={ref} className="mb-1 h-[200px]">
				{data.chartData.length ? (
					<Chart data={data} width={bounds.width} height={bounds.height} />
				) : (
					<span>no data</span>
				)}
			</div>

			<Labels data={data} />
		</>
	);
}

function Chart(props: { data: Data; width: number; height: number }) {
	const radius = props.height / 2;

	const arc = d3
		.arc()
		.innerRadius(radius * 0.55)
		.outerRadius(radius - 1);

	const pie = d3
		.pie<Data["chartData"][number]>()
		.padAngle(0.005)
		.value((d) => d.seconds);

	const pieData = pie(props.data.chartData);

	return (
		<svg viewBox={`0 0 ${props.width} ${props.height}`}>
			<g transform={`translate(${props.width / 2}, ${props.height / 2})`}>
				{pieData.map((d, i) => (
					<Fragment key={i}>
						<path d={arc(d)} fill={d.data.tag.color}>
							<title>{`${d.data.tag.label}: ${d.data.percentage}`}</title>
						</path>

						<text
							key={i}
							transform={`translate(${arc.centroid(d)})`}
							dy=".35em"
							textAnchor="middle"
							fill="currentColor"
							className="text-[12px] text-white"
						>
							{d.data.percentage}%
						</text>
					</Fragment>
				))}
			</g>
		</svg>
	);
}

function Labels(props: { data: Data }) {
	if (!props.data.chartData.length) return null;

	return (
		<div className="flex w-full flex-col divide-y divide-solid divide-gray-800/70 text-sm">
			<div className="flex gap-4 py-2 font-semibold">
				<div className="flex w-full items-center gap-2">
					<span className="w-full">Total</span>
				</div>

				<div className="flex gap-8">
					<span className="whitespace-nowrap">{`${secondsToHours(
						props.data.totalSeconds
					)} h`}</span>
				</div>
			</div>

			{props.data.chartData.map((d, i) => (
				<div key={i} className="flex gap-4 py-2">
					<div className="flex w-full h-full items-center gap-2">
						<div className="items-center flex">
							<div
								className="h-[0.6rem] w-[0.6rem] rounded-[50%]"
								style={{ backgroundColor: d.tag.color }}
							/>
						</div>
						<span className="w-full truncate">{d.tag.label}</span>
					</div>

					<div className="flex gap-8">
						<span>{d.percentage}%</span>
						<span className="whitespace-nowrap">{`${secondsToHours(
							d.seconds
						)} h`}</span>
					</div>
				</div>
			))}
		</div>
	);
}

function useData(props: { selectedDate: Date; timeframe: "year" | "month" | "week" }) {
	const startOfMonthSelectedDate =
		props.timeframe === "week"
			? startOfWeek(props.selectedDate, { weekStartsOn: 1 })
			: props.timeframe === "month"
			? startOfMonth(props.selectedDate)
			: startOfYear(props.selectedDate);
	const endOfMonthSelectedDate =
		props.timeframe === "week"
			? endOfWeek(props.selectedDate, { weekStartsOn: 1 })
			: props.timeframe === "month"
			? endOfMonth(props.selectedDate)
			: endOfYear(props.selectedDate);

	const dbTasks = useLiveQuery(
		() =>
			db.tasks
				.filter(
					(t) =>
						!t.deleted_at &&
						t.started_at >= startOfMonthSelectedDate &&
						t.started_at <= endOfMonthSelectedDate &&
						(!!t.stopped_at || !!t.expires_at)
				)
				.toArray(),
		[props.selectedDate, props.timeframe]
	);

	const dbTags = useDbTags([props.selectedDate, props.timeframe]);
	const dbTasksWith = dbTasks?.map((task) => ({
		...task,
		seconds: differenceInSeconds(task.stopped_at ?? task.expires_at, task.started_at),
	}));

	if (!dbTasks?.length)
		return {
			chartData: [],
			totalSeconds: 0,
		};

	const totalSeconds = dbTasksWith?.reduce((acc, cur) => acc + cur.seconds, 0) || 0;

	const data = (
		dbTags?.reduce(
			(acc, cur) => {
				const tasks = dbTasksWith?.filter((d) => d.tag_id === cur.id) ?? [];

				const taskSeconds = tasks
					.filter((d) => d.tag_id === cur.id)
					.reduce((acc, cur) => acc + cur.seconds, 0);

				const percentage = Math.round((taskSeconds / totalSeconds) * 100);

				if (!percentage) return acc;

				acc.push({
					tag: cur,
					seconds: taskSeconds,
					percentage,
				});

				return acc;
			},
			[] as {
				tag: DbTag;
				seconds: number;
				percentage: number;
			}[]
		) || []
	).sort((a, b) => b.percentage - a.percentage);

	return {
		chartData: data,
		totalSeconds,
	};
}

type Data = ReturnType<typeof useData>;
