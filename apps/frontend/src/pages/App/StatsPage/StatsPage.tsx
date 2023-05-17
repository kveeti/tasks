import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import endOfMonth from "date-fns/endOfMonth";
import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import type { ReactElement, ReactNode } from "react";

import { Button2 } from "@/Ui/Button";
import { cn } from "@/utils/classNames";

import { useMonthsTasks } from "./useMonthsTasks";

function getBarData(thisMonthsDates: Date[]) {
	return thisMonthsDates.map((date) => ({
		id: format(date, "d.M"),
		label: "coding",
		// random between 1 and 24
		value: Math.floor(Math.random() * 24) + 1,
	}));
}

export function StatsPage() {
	const data = useMonthsTasks({ date: new Date() });

	const now = new Date();
	const thisMonthsDates = eachDayOfInterval({
		start: startOfMonth(now),
		end: endOfMonth(now),
	});

	const barData = getBarData(thisMonthsDates);

	const values = barData.map((d) => d.value);
	const max = Math.max(...values);
	const half = Number((max / 2).toFixed(0));
	const yAxisValues = [0, half / 2, half, half + half / 2, max];

	const xAxisValues = thisMonthsDates
		.filter((date) => date.getDate() === 1 || date.getDate() % 6 === 0)
		.map((d) => format(d, "d.M"));

	return (
		<div className="flex flex-col pb-[10rem]">
			{data && (
				<>
					<header className="sticky top-0 z-10 flex justify-between border-b-2 border-b-gray-800 bg-gray-900">
						<h1 className="mb-4 pl-4 pt-4 text-2xl font-bold">Stats</h1>

						<div className="flex gap-1 p-2">
							<Button2 className="px-4 py-1">{"<"}</Button2>
							<Button2 className="px-4 py-1">May</Button2>
							<Button2 className="px-4 py-1">{">"}</Button2>
						</div>
					</header>

					<div className="flex flex-col gap-2 p-2">
						<Card>
							<Card.Header>Hours per day</Card.Header>
							<Card.Body className="h-[9rem]">
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
												text: {
													fill: "#fff",
												},
												line: {
													stroke: "#fff",
												},
											},
										},
									}}
									colors={{ scheme: "nivo" }}
									animate={false}
									isInteractive={false}
									enableLabel={false}
									data={barData}
									margin={{ top: 20, right: 0, bottom: 20, left: 30 }}
									padding={0.2}
									borderRadius={2}
									indexBy="id"
									axisTop={null}
									axisRight={null}
									axisBottom={{ tickValues: xAxisValues }}
									axisLeft={{
										tickValues: yAxisValues,
										tickSize: 0,
										format: (h) => `${h} h`,
									}}
									gridYValues={yAxisValues}
								/>
							</Card.Body>
						</Card>

						<Card>
							<Card.Header>Tag distribution</Card.Header>
							<Card.Body className="h-[14rem]">
								<ResponsivePie
									isInteractive={false}
									animate={false}
									data={data}
									colors={{ scheme: "nivo" }}
									margin={{ right: 100, left: 100, top: 20, bottom: 20 }}
									innerRadius={0.55}
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
							</Card.Body>
						</Card>
					</div>
				</>
			)}
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
				"h-full rounded-bl-xl rounded-br-xl border-b-2 border-l-2 border-r-2 border-gray-800 px-2 pb-2",
				props.className
			)}
		>
			{props.children}
		</div>
	);
}

Card.Header = Header;
Card.Body = Body;
