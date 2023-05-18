import { ResponsivePie } from "@nivo/pie";

import type { StatsPageData } from "./UseStatsPageData";

export function TagDistributionChart(props: {
	data: NonNullable<StatsPageData>["tagDistributionData"];
}) {
	return (
		<ResponsivePie
			isInteractive={false}
			animate={false}
			data={props.data}
			colors={{ scheme: "nivo" }}
			margin={{ top: 25, bottom: 20, right: 90, left: 90 }}
			innerRadius={0.5}
			padAngle={1}
			cornerRadius={3}
			activeOuterRadiusOffset={8}
			borderWidth={1}
			borderColor={{
				from: "color",
				modifiers: [["darker", 0.2]],
			}}
			arcLabel={(e) => `${e.value} h`}
			arcLinkLabel={({ label }) => {
				const string = label.toString();
				const isLonger = string.toString().length > 16;
				const slicedLabel = isLonger
					? string.toString().slice(0, 13).trim() + "..."
					: string;

				return slicedLabel;
			}}
			arcLinkLabelsColor={{ from: "color" }}
			arcLinkLabelsDiagonalLength={8}
			arcLinkLabelsStraightLength={4}
			arcLinkLabelsTextColor="#fff"
		/>
	);
}
