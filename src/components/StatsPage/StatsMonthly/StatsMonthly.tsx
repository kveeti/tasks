import { AnimatePresence } from "framer-motion";
import { useState } from "react";

import { Card } from "~ui/Card";
import { ErrorCard } from "~ui/ErrorCard";
import { trpc } from "~utils/trpc";

import { ChartMonthly } from "./ChartMonthly";
import { MonthlyTotal } from "./MonthlyTotal";
import { WeekData, WeekInfo } from "./WeekInfo";

type Props = {
	selectedWeek: Date;
};

export const StatsMonthly = ({ selectedWeek }: Props) => {
	const { data, isLoading, error } = trpc.me.stats.monthly.useQuery({ week: selectedWeek });
	const [selectedInnerWeek, setSelectedInnerWeek] = useState<WeekData | null>(null);

	const setNewSelectedInnerWeek = (week: WeekData | null) => {
		if (selectedInnerWeek?.week === week?.week) {
			setSelectedInnerWeek(null);
			return;
		}

		setSelectedInnerWeek(week);
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
					<ChartMonthly
						key="chart"
						data={data}
						selectedInnerWeek={selectedInnerWeek}
						setSelectedInnerWeek={setNewSelectedInnerWeek}
					/>

					{selectedInnerWeek && (
						<WeekInfo
							key="week-info"
							selectedInnerWeek={selectedInnerWeek}
							setSelectedInnerWeek={setNewSelectedInnerWeek}
						/>
					)}

					<MonthlyTotal key="total" data={data} />
				</AnimatePresence>
			) : (
				<Card className="mt-2 rounded-md">
					<div className="flex items-center justify-center px-2 py-[5rem]">No data</div>
				</Card>
			)}
		</AnimatePresence>
	);
};
