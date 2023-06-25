import addMonths from "date-fns/addMonths";
import addWeeks from "date-fns/addWeeks";
import addYears from "date-fns/addYears";
import endOfWeek from "date-fns/endOfWeek";
import format from "date-fns/format";
import isSameWeek from "date-fns/isSameWeek";
import isSameYear from "date-fns/isSameYear";
import subMonths from "date-fns/subMonths";
import subWeeks from "date-fns/subWeeks";
import subYears from "date-fns/subYears";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/Ui/NewButton";

import { WithAnimation } from "../WithAnimation";
import { HoursPerDayChart } from "./HoursPerDayChart";
import { TagDistributionChart } from "./TagDistributionChart";

export function AppNumbersPage() {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "year">("week");
	// week shows hours per day (7 days)
	// month shows hours per day (months days days)
	// year shows hours per month (12 months)

	const formattedSelectedDate =
		selectedTimeframe === "week"
			? isSameWeek(selectedDate, new Date())
				? "this week"
				: isSameWeek(selectedDate, subWeeks(new Date(), 1))
				? "last week"
				: format(
						selectedDate,
						`'week' w${
							isSameYear(endOfWeek(selectedDate, { weekStartsOn: 1 }), new Date())
								? ""
								: ", yyyy"
						}`
				  )
			: selectedTimeframe === "month"
			? format(selectedDate, "MMMM yyyy")
			: selectedTimeframe === "year"
			? format(selectedDate, "yyyy")
			: "";

	function toggleTimeFrame() {
		if (selectedTimeframe === "week") {
			setSelectedTimeframe("month");
		} else if (selectedTimeframe === "month") {
			setSelectedTimeframe("year");
		} else if (selectedTimeframe === "year") {
			setSelectedTimeframe("week");
		}
	}

	function scrollTimeFrame(direction: "left" | "right") {
		if (selectedTimeframe === "week") {
			if (direction === "left") {
				setSelectedDate((d) => subWeeks(d, 1));
			} else {
				setSelectedDate((d) => addWeeks(d, 1));
			}
		} else if (selectedTimeframe === "month") {
			if (direction === "left") {
				setSelectedDate((d) => subMonths(d, 1));
			} else {
				setSelectedDate((d) => addMonths(d, 1));
			}
		} else if (selectedTimeframe === "year") {
			if (direction === "left") {
				setSelectedDate((d) => subYears(d, 1));
			} else {
				setSelectedDate((d) => addYears(d, 1));
			}
		}
	}

	return (
		<WithAnimation>
			<div className="relative flex h-full w-full flex-col">
				<div className="flex h-full w-full flex-col gap-4 overflow-auto p-4">
					<h1 className="text-2xl font-bold">stats</h1>

					<div className="flex flex-col rounded-xl border border-gray-800 bg-gray-950/50 p-4">
						{selectedTimeframe === "week" || selectedTimeframe === "month" ? (
							<HoursPerDayChart
								selectedDate={selectedDate}
								timeframe={selectedTimeframe}
							/>
						) : (
							<div>not implemented</div>
						)}
					</div>

					<div className="flex flex-col rounded-xl border border-gray-800 bg-gray-950/50 p-4 pb-2">
						<TagDistributionChart
							selectedDate={selectedDate}
							timeframe={selectedTimeframe}
						/>
					</div>
				</div>

				<div className="border-t border-t-gray-800 bg-gray-900 p-4">
					<div className="flex w-full justify-between gap-4">
						<Button className="p-2" onPress={() => scrollTimeFrame("left")}>
							<ChevronLeft />
						</Button>

						<Button className="w-full p-2" onPress={() => toggleTimeFrame()}>
							{formattedSelectedDate}
						</Button>

						<Button className="p-2" onPress={() => scrollTimeFrame("right")}>
							<ChevronRight />
						</Button>
					</div>
				</div>
			</div>
		</WithAnimation>
	);
}
