import useMeasure from "react-use-measure";
import { Cell, Pie, PieChart } from "recharts";

import { type StatsPrecision, useTagDistributionStats } from "@/utils/api/stats";
import { secondsToHours } from "@/utils/number";

export function ChartTagDistribution({
	date,
	precision,
}: {
	date: Date;
	precision: StatsPrecision;
}) {
	const statsQuery = useTagDistributionStats({ date, precision });
	const [ref, bounds] = useMeasure();

	return (
		<section className="flex flex-col gap-2 rounded-xl border p-4 pt-3 bg-card-item">
			<h2 className="text-lg font-bold border-b pb-2 mb-2">tag distribution</h2>

			{statsQuery.isLoading ? (
				<p className="h-[180px] w-full">loading data...</p>
			) : statsQuery.isError ? (
				<p className="h-[180px] w-full">error loading data</p>
			) : !statsQuery.data || !statsQuery.data.stats?.length ? (
				<p className="h-[180px] w-full">no data</p>
			) : (
				<>
					<div ref={ref} className="h-[180px] w-full">
						<PieChart
							margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
							data={statsQuery.data.stats}
							width={bounds.width}
							height={bounds.height}
						>
							<Pie
								isAnimationActive={false}
								data={statsQuery.data.stats}
								innerRadius={45}
								outerRadius={85}
								labelLine={false}
								label={Label}
								dataKey="seconds"
							>
								{statsQuery.data.stats.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={entry.tag_color}
										stroke={entry.tag_color}
									/>
								))}
							</Pie>
						</PieChart>
					</div>

					<table className="text-sm">
						<thead className="font-semibold">
							<tr>
								<th className="text-start w-[60%] pb-2">tag</th>

								<th className="text-end pb-2">%</th>

								<th className="text-end pb-2">hours</th>
							</tr>
						</thead>

						<tbody className="divide-y border-t border-b">
							{statsQuery.data.stats.map((d, i) => (
								<tr key={i}>
									<td className="text-start w-[60%] py-2 gap-2 flex items-center">
										<div className="flex items-center justify-center">
											<div
												aria-hidden
												className="h-2.5 w-2.5 rounded-full"
												style={{ backgroundColor: d.tag_color }}
											/>
										</div>

										<p className="w-full truncate">{d.tag_label}</p>
									</td>

									<td className="text-end py-2">{d.percentage}%</td>

									<td className="text-end py-2">{secondsToHours(d.seconds)} h</td>
								</tr>
							))}
						</tbody>

						<tfoot className="font-semibold">
							<tr>
								<th colSpan={2} className="text-start pt-2">
									total
								</th>

								<td className="text-end whitespace-nowrap pt-2">
									{secondsToHours(statsQuery.data.total_seconds)} h
								</td>
							</tr>
						</tfoot>
					</table>
				</>
			)}
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
