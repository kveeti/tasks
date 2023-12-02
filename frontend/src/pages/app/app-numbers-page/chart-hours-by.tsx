import { format } from "date-fns";
import useMeasure from "react-use-measure";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useHoursByStats, type StatsPrecision } from "@/utils/api/stats";

export function ChartHoursBy({ date, precision }: { date: Date; precision: StatsPrecision }) {
	const stats = useHoursByStats({ date, precision });
	const [ref, bounds] = useMeasure();

	return (
		<section className="flex flex-col rounded-xl bg-card-item border p-4">
			<h2 className="text-lg font-bold border-b pb-2">hours by</h2>

			<div ref={ref} className="min-h-[180px] flex items-center justify-center">
				{stats.isLoading ? (
					<p>loading stats...</p>
				) : stats.isError ? (
					<p>error loading stats</p>
				) : !stats.data || !stats.data.stats?.length ? (
					<p>no data</p>
				) : (
					<BarChart
						margin={{ bottom: -10, left: -25, right: 0, top: 20 }}
						data={stats.data.stats}
						width={bounds.width}
						height={bounds.height}
					>
						<title>hours by</title>
						<CartesianGrid strokeDasharray="2,4" stroke="#555" vertical={false} />
						<XAxis
							dataKey="date"
							tickFormatter={(value: (typeof stats.data.stats)[number]["date"]) =>
								precision === "day"
									? format(new Date(value), "EEE").toLocaleLowerCase()
									: precision === "week"
									  ? format(new Date(value), "'w' w")
									  : precision === "month"
									    ? format(new Date(value), "MMM").toLocaleLowerCase()
									    : ""
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
				)}
			</div>
		</section>
	);
}
