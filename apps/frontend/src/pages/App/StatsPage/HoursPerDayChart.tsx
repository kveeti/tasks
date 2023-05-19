import { ResponsiveBar } from "@nivo/bar";

import type { StatsPageData } from "./UseStatsPageData";

type Props = {
	hoursPerDayData: NonNullable<StatsPageData>["hoursPerDayData"];
	uniqueMonthsTagLabels: NonNullable<StatsPageData>["uniqueMonthsTagLabels"];
};

export function HoursPerDayChart(props: Props) {
	return (
		<ResponsiveBar
			theme={{
				grid: {
					line: {
						strokeWidth: 1,
						stroke: "#636363",
					},
				},
				axis: {
					ticks: {
						text: { fill: "#fff" },
						line: { stroke: "#fff" },
					},
				},
			}}
			colors={{ scheme: "nivo" }}
			animate={false}
			isInteractive={false}
			enableLabel={false}
			data={props.hoursPerDayData.data}
			keys={[...props.uniqueMonthsTagLabels]}
			margin={{ top: 10, right: 0, bottom: 20, left: 35 }}
			padding={0.2}
			borderRadius={2}
			indexBy="id"
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickValues: props.hoursPerDayData.xAxisValues,
			}}
			axisLeft={{
				tickValues: props.hoursPerDayData.yAxisValues,
				tickSize: 0,
				format: (h) => `${h} h`,
			}}
			gridYValues={props.hoursPerDayData.yAxisValues}
		/>
	);
}
