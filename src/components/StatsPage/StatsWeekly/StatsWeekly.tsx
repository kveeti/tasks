import { AnimatePresence } from "framer-motion";
import { useState } from "react";

import { Card } from "~ui/Card";
import { ErrorCard } from "~ui/ErrorCard";
import { trpc } from "~utils/trpc";

import { ChartWeekly } from "./ChartWeekly";
import { WeeklyTotal } from "./DailyTotal";
import { WeekdayInfo, WeekdayInfoDay } from "./WeekdayInfo";

type Props = {
	selectedWeek: Date;
};

export const StatsWeekly = ({ selectedWeek }: Props) => {
	const [selectedDay, setSelectedDay] = useState<WeekdayInfoDay | null>(null);
	const { data, isLoading, error } = trpc.me.stats.weekly.useQuery({ week: selectedWeek });

	const setNewSelectedDay = (day: WeekdayInfoDay | null) => {
		if (selectedDay?.date === day?.date) {
			setSelectedDay(null);
			return;
		}

		setSelectedDay(day);
	};

	return (
		<AnimatePresence>
			{isLoading ? (
				<Card className="mt-2 animate-pulse rounded-md">
					<div className="flex items-center justify-center px-2 py-[5rem]">
						Loading...
					</div>
				</Card>
			) : error ? (
				<ErrorCard className="mt-2">
					<p>Failed to load stats</p>
				</ErrorCard>
			) : data?.hasData ? (
				<AnimatePresence>
					<ChartWeekly
						key="chart"
						data={data}
						selectedDay={selectedDay}
						setSelectedDay={setNewSelectedDay}
					/>

					{selectedDay && (
						<WeekdayInfo
							key="weekday-info"
							data={selectedDay}
							setSelectedDay={setNewSelectedDay}
						/>
					)}

					<WeeklyTotal key="weekly-total" data={data} />
				</AnimatePresence>
			) : (
				<Card className="mt-2 rounded-md">
					<div className="flex items-center justify-center px-2 py-[5rem]">No data</div>
				</Card>
			)}
		</AnimatePresence>
	);
};
