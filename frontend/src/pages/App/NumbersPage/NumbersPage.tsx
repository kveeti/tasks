import format from "date-fns/format";
import { useState } from "react";

import { TestButton } from "@/Ui/Button";
import { Card } from "@/Ui/Card";
import { useIsMobile } from "@/utils/useMediaQuery";

import { WithAnimation } from "../WithAnimation";
import { HoursPerDayChart } from "./HoursPerDayChart";
import { TagDistributionChart } from "./TagDistributionChart";
import { useStatsPageData } from "./UseStatsPageData";

export function NumbersPage() {
	const [date, setDate] = useState(new Date());
	const { data, status } = useStatsPageData(date);

	return (
		<WithAnimation>
			<div className="flex flex-col">
				<Title />

				<div className="flex h-full flex-col gap-2 pb-[10rem] not-mobile:p-2">
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

			<Functions />
		</WithAnimation>
	);
}

function Title() {
	const isMobile = useIsMobile();

	return isMobile ? (
		<div>
			<h1 className="py-10 text-4xl">Stats</h1>
		</div>
	) : (
		<div className="sticky top-0 flex items-center justify-between border-b-2 border-b-gray-800 bg-gray-900 p-2">
			<h1 className="text-2xl font-bold">Stats</h1>
		</div>
	);
}

function Functions() {
	return (
		<div className="fixed bottom-0 left-0 right-0 flex w-full items-center justify-center pb-[4.5rem]">
			<div className="z-10 flex w-full max-w-[22rem] gap-2 rounded-2xl border-2 border-gray-800/50 bg-gray-900 p-2">
				<TestButton className="w-max rounded-xl px-4 py-1">{"<"}</TestButton>
				<TestButton className="w-full rounded-xl px-4 py-1">
					{format(new Date(), "MMM YYY")}
				</TestButton>
				<TestButton className="w-max rounded-xl px-4 py-1">{">"}</TestButton>
			</div>
		</div>
	);
}
