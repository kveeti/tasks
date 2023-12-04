import { format } from "date-fns";
import useMeasure from "react-use-measure";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useHoursByStats } from "@/utils/api/stats";

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
	const [ref, bounds] = useMeasure();

	return (
		<section className="flex flex-col rounded-xl bg-card-item border p-4">
			<h2 className="text-lg font-bold border-b pb-2 mb-2">hours by</h2>

			{stats.isLoading ? (
				<p className="h-[180px] w-full">loading stats...</p>
			) : stats.isError ? (
				<p className="h-[180px] w-full">error loading stats</p>
			) : !stats.data || !stats.data.stats?.length ? (
				<p className="h-[180px] w-full">no data</p>
			) : (
				<div ref={ref} className="min-h-[180px] flex items-center justify-center">
					<BarChart
						margin={{
							bottom: -10,
							left:
								stats.data.most_hours > 1000
									? -10
									: stats.data.most_hours > 100
									  ? -20
									  : stats.data.most_hours > 10
									    ? -25
									    : -33,

							right: 0,
							top: 20,
						}}
						data={stats.data.stats}
						width={bounds.width}
						height={bounds.height}
					>
						<CartesianGrid strokeDasharray="2,4" stroke="#555" vertical={false} />
						<XAxis
							dataKey="date"
							tickFormatter={(date: (typeof stats.data.stats)[number]["date"]) =>
								formatXTick(
									new Date(date),
									precision,
									timeframe
								).toLocaleLowerCase()
							}
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickCount={5}
							domain={([, dataMax]) => [0, dataMax > 8 ? dataMax : 8]}
							tickFormatter={(value: number) => value + " h"}
						/>
						<Bar
							isAnimationActive={false}
							radius={[6, 6, 6, 6]}
							dataKey="hours"
							fill="#eee"
						/>
					</BarChart>
				</div>
			)}
		</section>
	);
}

function formatXTick(date: Date, precision: "day" | "month", timeframe: "week" | "month" | "year") {
	if (timeframe === "week") {
		return format(date, "EEE");
	} else if (timeframe === "month") {
		return format(date, "d");
	} else if (timeframe === "year") {
		return format(date, "MMMMM");
	}

	throw new Error("invalid precision");
}
