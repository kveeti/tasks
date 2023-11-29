import { secondsToHours } from "date-fns";
import useMeasure from "react-use-measure";
import { Cell, Pie, PieChart } from "recharts";

import { type StatsPrecision, useTagDistributionStats } from "@/utils/api/stats";

export function ChartTagDistribution({
	date,
	precision,
}: {
	date: Date;
	precision: StatsPrecision;
}) {
	const stats = useTagDistributionStats({ date, precision });
	const [ref, bounds] = useMeasure();

	return (
		<section className="flex flex-col rounded-xl border p-4 pt-3 bg-card-item">
			<h2 className="text-lg font-bold border-b pb-2 mb-2">tag distribution</h2>

			<div className="flex flex-col items-center justify-center">
				{stats.isLoading ? (
					<p>loading data...</p>
				) : stats.isError ? (
					<p>error loading data</p>
				) : !stats.data || !stats.data.stats?.length ? (
					<p>no data</p>
				) : (
					<>
						<div ref={ref} className="h-[180px] w-full">
							<PieChart
								margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
								data={stats.data.stats}
								width={bounds.width}
								height={bounds.height}
							>
								<Pie
									isAnimationActive={false}
									data={stats.data.stats}
									innerRadius={45}
									outerRadius={85}
									labelLine={false}
									label={Label}
									dataKey="seconds"
								>
									{stats.data.stats.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.tag_color}
											stroke={entry.tag_color}
										/>
									))}
								</Pie>
							</PieChart>
						</div>

						<div className="flex w-full flex-col text-sm">
							<div className="flex gap-4 font-semibold">
								<div className="flex w-full items-center gap-2">
									<span className="w-full">total</span>
								</div>

								<div className="flex gap-8">
									<span className="whitespace-nowrap">
										{Math.floor(secondsToHours(stats.data.total_seconds))} h
									</span>
								</div>
							</div>

							<div className="border-t w-full my-2" aria-hidden></div>

							<ul className="space-y-2">
								{stats.data?.stats.map((d, i) => (
									<li key={i} className="flex gap-2">
										<div className="flex w-full h-full items-center gap-2">
											<div className="items-center flex">
												<div
													className="h-[0.6rem] w-[0.6rem] rounded-[50%]"
													style={{ backgroundColor: d.tag_color }}
												/>
											</div>
											<span className="w-full truncate">{d.tag_label}</span>
										</div>

										<div className="flex gap-8">
											<span>{d.percentage}%</span>
											<span className="whitespace-nowrap">
												{Math.floor(secondsToHours(d.seconds))} h
											</span>
										</div>
									</li>
								))}
							</ul>
						</div>
					</>
				)}
			</div>
		</section>
	);
}

const RADIAN = Math.PI / 180;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Label = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
	if (percentage < 1) return null;

	const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);

	return (
		<text
			x={x}
			y={y}
			fontSize={12}
			fontWeight={500}
			fill="#fff"
			textAnchor="middle"
			dominantBaseline="central"
		>
			{percentage}%
		</text>
	);
};
