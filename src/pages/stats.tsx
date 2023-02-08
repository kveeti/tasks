import addWeeks from "date-fns/addWeeks";
import format from "date-fns/format";
import subWeeks from "date-fns/subWeeks";
import { useState } from "react";

import { StatsMonthly } from "~components/StatsPage/StatsMonthly/StatsMonthly";
import { StatsWeekly } from "~components/StatsPage/StatsWeekly/StatsWeekly";
import { Button } from "~ui/Button";
import { Card } from "~ui/Card";
import { ChevronLeft } from "~ui/Icons/ChevronLeft";
import { ChevronRight } from "~ui/Icons/ChevronRight";
import { Layout } from "~ui/Layout/Layout";
import type { Page } from "~utils/PageType";

const StatsPage: Page = () => {
	const [selectedWeek, setSelectedWeek] = useState(new Date());
	const [mode, setMode] = useState<"week" | "month">("week");

	const changeMode = () => {
		if (mode === "week") {
			setMode("month");
		} else {
			setMode("week");
		}
	};

	const subtractWeek = () => {
		if (mode === "week") {
			setSelectedWeek(subWeeks(selectedWeek, 1));
		} else {
			setSelectedWeek(subWeeks(selectedWeek, 4));
		}
	};

	const addWeek = () => {
		if (mode === "week") {
			setSelectedWeek(addWeeks(selectedWeek, 1));
		} else {
			setSelectedWeek(addWeeks(selectedWeek, 4));
		}
	};

	return (
		<Layout title="Stats">
			<h1 className="pb-10 text-4xl font-bold">Stats</h1>

			<Card className="rounded-xl">
				<div className="flex w-full flex-col p-2">
					<div className="flex justify-between gap-2">
						<Button onClick={subtractWeek}>
							<ChevronLeft />
						</Button>
						<Button className="w-full text-sm" onClick={changeMode}>
							{mode === "week" ? (
								<>Week {format(selectedWeek, "I", { weekStartsOn: 1 })}</>
							) : (
								<>{format(selectedWeek, "LLL yyyy", { weekStartsOn: 1 })}</>
							)}
						</Button>
						<Button onClick={addWeek}>
							<ChevronRight />
						</Button>
					</div>

					{mode === "week" ? (
						<StatsWeekly selectedWeek={selectedWeek} />
					) : (
						<StatsMonthly selectedWeek={selectedWeek} />
					)}
				</div>
			</Card>
		</Layout>
	);
};

StatsPage.requireAuth = true;
StatsPage.requireAdmin = false;

export default StatsPage;
