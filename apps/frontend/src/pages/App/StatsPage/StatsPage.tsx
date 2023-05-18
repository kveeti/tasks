import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import addMonths from "date-fns/addMonths";
import format from "date-fns/format";
import subMonths from "date-fns/subMonths";
import { type ReactNode, useState } from "react";

import { Button2 } from "@/Ui/Button";
import { cn } from "@/utils/classNames";

import { useStatsPageData } from "./UseStatsPageData";

export function StatsPage() {
	const [date, setDate] = useState(new Date());
	const { data, status } = useStatsPageData(date);

	return (
		<div className="flex flex-col">
			<div className="sticky top-0 z-10 flex w-full gap-2 border-b-2 border-b-gray-800 bg-gray-900 p-2">
				<Button2
					className="w-max px-4 py-1"
					onPress={() => setDate((prev) => subMonths(prev, 1))}
				>
					{"<"}
				</Button2>
				<Button2 className="w-full px-4 py-1">{format(date, "MMM YYY")}</Button2>
				<Button2
					className="w-max px-4 py-1"
					onPress={() => setDate((prev) => addMonths(prev, 1))}
				>
					{">"}
				</Button2>
			</div>

			<div className="flex h-full flex-col gap-2 p-2">
				<Card>
					<Card.Header>Hours per day</Card.Header>

					<Card.Body className="h-[8rem]">
						{status !== "data" ? (
							<div className="flex h-full w-full items-center justify-center">
								{status === "loading" ? "Loading..." : "No data"}
							</div>
						) : (
							<ResponsiveBar
								key={date.toString()}
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
								data={data.barData}
								keys={[...data.monthsTags]}
								margin={{ top: 20, right: 0, bottom: 20, left: 35 }}
								padding={0.2}
								borderRadius={2}
								indexBy="id"
								axisTop={null}
								axisRight={null}
								axisBottom={{
									tickValues: data.xAxisValues,
								}}
								axisLeft={{
									tickValues: data.yAxisValues,
									tickSize: 0,
									format: (h) => `${h} h`,
								}}
								gridYValues={data.yAxisValues}
							/>
						)}
					</Card.Body>
				</Card>

				<Card>
					<Card.Header>Tag distribution</Card.Header>

					<Card.Body className="h-[14rem] p-2">
						{status !== "data" ? (
							<div className="flex h-full w-full items-center justify-center">
								{status === "loading" ? "Loading..." : "No data"}
							</div>
						) : (
							<ResponsivePie
								isInteractive={false}
								animate={false}
								data={data.pieData}
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
						)}
					</Card.Body>
				</Card>
			</div>
		</div>
	);
}

function Card(props: { children: ReactNode; className?: string }) {
	return (
		<div className={cn("flex h-full flex-col rounded-xl", props.className)}>
			{props.children}
		</div>
	);
}

function Header(props: { children: ReactNode }) {
	return (
		<h2 className="rounded-tl-xl rounded-tr-xl border-b-2 border-l-2 border-r-2 border-t-2 border-gray-800 bg-gray-900 px-3 py-2 font-bold">
			{props.children}
		</h2>
	);
}

function Body(props: { children: ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"rounded-bl-xl rounded-br-xl border-b-2 border-l-2 border-r-2 border-gray-800 p-2",
				props.className
			)}
		>
			{props.children}
		</div>
	);
}

Card.Header = Header;
Card.Body = Body;
