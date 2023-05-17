import { ResponsivePie } from "@nivo/pie";
import { useState } from "react";

const data = [
	{
		id: "1",
		label: "Coding",
		value: 100,
	},
	{
		id: "2",
		label: "Cyclingasdfasdfasdfasdf",
		value: 60,
	},
	{
		id: "3",
		label: "Reading",
		value: 23,
	},
	{
		id: "4",
		label: "Sleeping",
		value: 100,
	},
	{
		id: "5",
		label: "Eating",
		value: 100,
	},
	{
		id: "6",
		label: "Working",
		value: 100,
	},
	{
		id: "7",
		label: "Studying",
		value: 100,
	},
];

export function StatsPage() {
	const [date, setDate] = useState(new Date());

	return (
		<div className="h-full pb-[10rem]">
			<ResponsivePie
				isInteractive={false}
				animate={false}
				data={data}
				colors={{ scheme: "spectral" }}
				margin={{ right: 100, left: 100 }}
				innerRadius={0.5}
				padAngle={0.7}
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
					const isLonger = string.toString().length > 13;
					const slicedLabel = isLonger
						? string.toString().slice(0, 10).trim() + "..."
						: string;

					return slicedLabel;
				}}
				arcLinkLabelsColor={{ from: "color" }}
				arcLinkLabelsDiagonalLength={4}
				arcLinkLabelsStraightLength={4}
				arcLinkLabelsTextColor="#fff"
				tooltip={({ datum: { formattedValue, label } }) => (
					<div className="flex flex-col items-center rounded-md border border-gray-800 bg-gray-900 px-3 py-2 shadow-md">
						<span>{label}</span> <span>{formattedValue} h</span>
					</div>
				)}
			/>
		</div>
	);
}
