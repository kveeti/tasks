import {
	addMonths,
	addWeeks,
	addYears,
	endOfWeek,
	format,
	isSameWeek,
	isSameYear,
	subMonths,
	subWeeks,
	subYears,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { type StatsTimeframe } from "@/utils/api/stats";

import { ChartHoursBy } from "./chart-hours-by";
import { ChartTagDistribution } from "./chart-tag-distribution";

export function AppNumbersPage() {
	const { date, timeframe, formattedDate, toggleTimeFrame, scrollTimeframe } = usePageState();

	return (
		<PageLayout>
			<PageLayout.Title>stats</PageLayout.Title>

			<div className="flex gap-4 h-full relative flex-col overflow-auto bg-card p-4">
				<ChartHoursBy date={date} timeframe={timeframe} />

				<ChartTagDistribution date={date} timeframe={timeframe} />
			</div>

			<PageLayout.Footer className="flex gap-4">
				<Button size="icon" onClick={() => scrollTimeframe("left")}>
					<ChevronLeftIcon className="w-5 h-5" />
				</Button>
				<Button size="icon" className="grow" onClick={toggleTimeFrame}>
					{formattedDate}
				</Button>
				<Button size="icon" onClick={() => scrollTimeframe("right")}>
					<ChevronRightIcon className="w-5 h-5" />
				</Button>
			</PageLayout.Footer>
		</PageLayout>
	);
}

function usePageState() {
	const [date, setDate] = useState(new Date());
	const [timeframe, setTimeframe] = useState<StatsTimeframe>("week");

	const formattedDate =
		timeframe === "week"
			? isSameWeek(date, new Date())
				? "this week"
				: isSameWeek(date, subWeeks(new Date(), 1))
				? "last week"
				: format(
						date,
						`'week' w${
							isSameYear(endOfWeek(date, { weekStartsOn: 1 }), new Date())
								? ""
								: ", yyyy"
						}`
				  )
			: timeframe === "month"
			? format(date, "MMMM yyyy")
			: timeframe === "year"
			? format(date, "yyyy")
			: "";

	function toggleTimeFrame() {
		if (timeframe === "week") {
			setTimeframe("month");
		} else if (timeframe === "month") {
			setTimeframe("year");
		} else if (timeframe === "year") {
			setTimeframe("week");
		}
	}

	function scrollTimeframe(direction: "left" | "right") {
		if (timeframe === "week") {
			if (direction === "left") {
				setDate((d) => subWeeks(d, 1));
			} else {
				setDate((d) => addWeeks(d, 1));
			}
		} else if (timeframe === "month") {
			if (direction === "left") {
				setDate((d) => subMonths(d, 1));
			} else {
				setDate((d) => addMonths(d, 1));
			}
		} else if (timeframe === "year") {
			if (direction === "left") {
				setDate((d) => subYears(d, 1));
			} else {
				setDate((d) => addYears(d, 1));
			}
		}
	}

	return {
		date,
		timeframe,
		formattedDate,
		toggleTimeFrame,
		scrollTimeframe,
	};
}
