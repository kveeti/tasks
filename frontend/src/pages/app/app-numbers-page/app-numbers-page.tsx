import {
	addMonths,
	addWeeks,
	endOfWeek,
	format,
	isSameWeek,
	isSameYear,
	subMonths,
	subWeeks,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { type StatsPrecision } from "@/utils/api/stats";

import { ChartHoursBy } from "./chart-hours-by";
import { ChartTagDistribution } from "./chart-tag-distribution";

export function AppNumbersPage() {
	const { date, precision, formattedDate, toggleTimeFrame, scrollPrecision } = usePageState();

	return (
		<PageLayout>
			<PageLayout.Title>stats</PageLayout.Title>

			<main className="flex gap-4 h-full relative flex-col overflow-auto bg-card p-4">
				<ChartHoursBy date={date} precision={precision} />

				<ChartTagDistribution date={date} precision={precision} />
			</main>

			<PageLayout.Footer className="flex gap-4">
				<Button size="icon" onClick={() => scrollPrecision("left")}>
					<ChevronLeftIcon className="w-5 h-5" />
				</Button>
				<Button size="icon" className="grow" onClick={toggleTimeFrame}>
					{formattedDate}
				</Button>
				<Button size="icon" onClick={() => scrollPrecision("right")}>
					<ChevronRightIcon className="w-5 h-5" />
				</Button>
			</PageLayout.Footer>
		</PageLayout>
	);
}

function usePageState() {
	const [date, setDate] = useState(new Date());
	const [precision, setPrecision] = useState<StatsPrecision>("day");

	const formattedDate =
		precision === "day"
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
			: precision === "week"
			? format(date, "MMMM yyyy")
			: precision === "month"
			? format(date, "yyyy")
			: "";

	function toggleTimeFrame() {
		if (precision === "day") {
			setPrecision("week");
		} else if (precision === "week") {
			setPrecision("month");
		} else if (precision === "month") {
			setPrecision("day");
		}
	}

	function scrollPrecision(direction: "left" | "right") {
		if (precision === "day") {
			if (direction === "left") {
				setDate((d) => subWeeks(d, 1));
			} else {
				setDate((d) => addWeeks(d, 1));
			}
		} else if (precision === "week") {
			if (direction === "left") {
				setDate((d) => subWeeks(d, 1));
			} else {
				setDate((d) => addWeeks(d, 1));
			}
		} else if (precision === "month") {
			if (direction === "left") {
				setDate((d) => subMonths(d, 1));
			} else {
				setDate((d) => addMonths(d, 1));
			}
		}
	}

	return {
		date,
		precision,
		formattedDate,
		toggleTimeFrame,
		scrollPrecision,
	};
}
