import { useState } from "react";

import { WithAnimation } from "@/components/with-animation";
import { type StatsTimeframe, useStats } from "@/utils/api/stats";

export function AppNumbersPage() {
	const [date, setDate] = useState(new Date());
	const [timeframe, setTimeframe] = useState<StatsTimeframe>("week");

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 p-4 border-b">
					<h1 className="text-xl font-bold">stats</h1>
				</div>

				<div className="flex h-full relative flex-col overflow-auto bg-black p-4">
					<ChartHoursBy date={date} timeframe={timeframe} />
				</div>

				<div className="border-t p-4"></div>
			</div>
		</WithAnimation>
	);
}

function ChartHoursBy({ date, timeframe }: { date: Date; timeframe: StatsTimeframe }) {
	const stats = useStats({ date, timeframe });

	return (
		<section className="flex flex-col rounded-xl border p-4">
			<h2 className="text-lg font-bold border-b pb-3">hours by </h2>

			<div className="h-[180px] flex items-center justify-center">
				{stats.isLoading ? (
					<p>loading stats...</p>
				) : stats.isError ? (
					<p>error loading stats</p>
				) : !stats.data || !stats.data.stats?.length ? (
					<p>no data</p>
				) : (
					<></>
				)}
			</div>
		</section>
	);
}
