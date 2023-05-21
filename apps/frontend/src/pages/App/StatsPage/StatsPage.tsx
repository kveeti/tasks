import addMonths from "date-fns/addMonths";
import format from "date-fns/format";
import subMonths from "date-fns/subMonths";
import { useState } from "react";

import { Button2 } from "@/Ui/Button";
import { Card } from "@/Ui/Card";

import { WithAnimation } from "../WithAnimation";
import { HoursPerDayChart } from "./HoursPerDayChart";
import { TagDistributionChart } from "./TagDistributionChart";
import { useStatsPageData } from "./UseStatsPageData";

export function StatsPage() {
	const [date, setDate] = useState(new Date());
	const { data, status } = useStatsPageData(date);

	console.log({ data });

	return (
		<WithAnimation>
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
								<HoursPerDayChart
									hoursPerDayData={data.hoursPerDayData}
									uniqueMonthsTagLabels={data.uniqueMonthsTagLabels}
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
								<TagDistributionChart data={data.tagDistributionData} />
							)}
						</Card.Body>
					</Card>
				</div>
			</div>
		</WithAnimation>
	);
}
