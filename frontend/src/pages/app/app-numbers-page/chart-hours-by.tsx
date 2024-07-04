import { format } from "date-fns";
import useMeasure from "react-use-measure";
import { Bar, BarChart, CartesianGrid, Label, ReferenceLine, XAxis, YAxis } from "recharts";

import { useHoursByStats } from "@/lib/api/stats";
import { getHoursAndMinutes } from "@/lib/time";

export function ChartHoursBy({
	start,
	end,
	precision,
	timeframe,
}: {
	start: Date;
	end: Date;
	precision: "day" | "month";
	timeframe: "week" | "month" | "year";
}) {
	const stats = useHoursByStats({ start, end, precision });

	return (
		<section className="flex flex-col rounded-xl bg-card-item border p-4 pt-3">
			<Title timeframe={timeframe} avg_hours_api={stats.data?.avg_hours ?? 0} />

			{stats.isLoading ? (
				<p className="h-[180px] w-full">loading stats...</p>
			) : stats.isError ? (
				<p className="h-[180px] w-full">error loading stats</p>
			) : !stats.data || !stats.data.stats?.length ? (
				<p className="h-[180px] w-full">no data</p>
			) : (
				<Chart data={stats.data} timeframe={timeframe} />
			)}
		</section>
	);
}

function Title({
	avg_hours_api,
	timeframe,
}: {
	timeframe: "week" | "month" | "year";
	avg_hours_api: number;
}) {
	const { hours: avg_hours, minutes: avg_minutes } = getHoursAndMinutes(avg_hours_api);

	const avgTimeframeText =
		timeframe === "week" || timeframe === "month"
			? "daily"
			: timeframe === "year"
				? "monthly"
				: null;

	const minutesText = avg_minutes > 0 && Math.round(avg_minutes) + "m";
	const hoursText = avg_hours > 0 && Math.round(avg_hours) + "h";

	return (
		<div className="border-b pb-2 mb-2">
			<h2 className="text-gray-400">{avgTimeframeText} average</h2>

			<p className="font-medium text-lg">
				{hoursText || minutesText ? (
					<>
						{hoursText && hoursText} {minutesText && minutesText}
					</>
				) : (
					"no data"
				)}
			</p>
		</div>
	);
}

function Chart({
	data,
	timeframe,
}: {
	data: NonNullable<ReturnType<typeof useHoursByStats>["data"]>;
	timeframe: "week" | "month" | "year";
}) {
	const [ref, bounds] = useMeasure();

	const chartData = (data.stats ?? []).map((s) => {
		const statsObj: Record<(typeof s.stats)[number]["tag_id"], Record<string, unknown>> = {};

		for (const stat of s.stats) {
			statsObj[stat.tag_id] = {
				label: stat.tag_label,
				color: stat.tag_color,
				hours: stat.hours,
			};
		}

		return {
			date: s.date,
			...statsObj,
		};
	});
	return (
		<div ref={ref} className="min-h-[180px] flex items-center justify-center">
			<BarChart
				margin={{
					bottom: -10,
					left:
						data.most_hours > 1000
							? -10
							: data.most_hours > 100
								? -20
								: data.most_hours > 10
									? -25
									: -33,

					right: 24,
					top: 10,
				}}
				data={chartData}
				width={bounds.width}
				height={bounds.height}
			>
				<CartesianGrid strokeDasharray="2,4" stroke="#555" vertical={false} />
				<XAxis
					dataKey="date"
					tickFormatter={(date: (typeof data.stats)[number]["date"]) =>
						formatXTick(new Date(date), timeframe).toLocaleLowerCase()
					}
					fontSize={13}
					tickLine={false}
					axisLine={false}
					stroke="#999"
				/>
				<YAxis
					stroke="#999"
					fontSize={13}
					tickLine={false}
					axisLine={false}
					tickCount={9}
					tickMargin={0}
					domain={() => {
						const max = Math.ceil(data.most_hours);
						return [0, max > 8 ? max : 8];
					}}
					tickFormatter={(value: number) => value + "h"}
				/>

				{data.tags.map((tag) => (
					<Bar
						isAnimationActive={false}
						fill={tag.color}
						stackId="id"
						dataKey={tag.id + ".hours"}
					/>
				))}

				<ReferenceLine isFront stroke="#00b00c" strokeDasharray="3 4" y={data.avg_hours}>
					<Label
						value="avg"
						stroke="#00b00c"
						fontWeight={100}
						fontSize={13}
						offset={3}
						position="right"
					/>
				</ReferenceLine>
			</BarChart>
		</div>
	);
}

function formatXTick(date: Date, timeframe: "week" | "month" | "year") {
	if (timeframe === "week") {
		return format(date, "EEE");
	} else if (timeframe === "month") {
		return format(date, "d");
	} else if (timeframe === "year") {
		return format(date, "MMMMM");
	}

	throw new Error("invalid precision");
}
