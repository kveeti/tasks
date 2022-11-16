import addWeeks from "date-fns/addWeeks";
import format from "date-fns/format";
import subWeeks from "date-fns/subWeeks";
import { motion } from "framer-motion";
import { useState } from "react";

import { Button } from "~ui/Button";
import { Layout } from "~ui/Layout/Layout";
import { Page } from "~utils/PageType";
import { classNames } from "~utils/classNames";
import { trpc } from "~utils/trpc";

// 20 random colors
const colors = [
	"#F9A8D4",
	"#FCD34D",
	"#F87171",
	"#34D399",
	"#60A5FA",
	"#DB2777",
	"#FBBF24",
	"#F87171",
	"#059669",
	"#2563EB",
	"#D97706",
	"#EF4444",
	"#10B981",
	"#3B82F6",
	"#D97706",
	"#EF4444",
	"#10B981",
	"#3B82F6",
	"#D97706",
	"#EF4444",
];

const StatsPage: Page = () => {
	const [selectedWeek, setSelectedWeek] = useState(new Date());
	const { data, isLoading } = trpc.me.stats.daily.useQuery({ week: selectedWeek });

	const min = Math.min(...(data?.map((d) => d.totalMinutes) ?? []));
	const max = Math.max(...(data?.map((d) => d.totalMinutes) ?? []));
	const dmin = 0;
	const dmax = 150;
	const range = max - min;
	const yNumbers = 4;
	const yBetween = range / yNumbers;

	const scaled = data?.map((d) => ({
		...d,
		totalMinutesScaled: Math.round(
			((d.totalMinutes - min) / (max - min)) * (dmax - dmin) + dmin
		),
		tagMinutes: d.tagMinutes.map((t, i) => ({
			...t,
			minutesScaled: Math.round(((t.minutes - min) / (max - min)) * (dmax - dmin) + dmin),
			color: colors[i],
		})),
	}));

	return (
		<Layout>
			<div className="mb-4 flex justify-between gap-2">
				<Button onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}> {"<-"} </Button>
				<Button
					onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
					className="w-full text-sm"
				>
					Week {format(selectedWeek, "I")}
				</Button>
				<Button onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}> {"->"} </Button>
			</div>
			{isLoading ? (
				<div>loading</div>
			) : (
				<>
					<div className="flex gap-2">
						<div className="grid h-[150px] w-full grid-cols-8 items-end justify-end gap-1">
							{scaled?.map((d, i) => (
								<div className="flex flex-col">
									{d.tagMinutes.map((tm, tmIndex) => {
										const isFirst = tmIndex === 0;
										const isLast = tmIndex === d.tagMinutes.length - 1;

										console.log({ tm, tmIndex });

										return (
											<motion.div
												key={`${d.date.toISOString()}-${tm.tag.id}`}
												className={classNames(
													isFirst && "rounded-tl-md rounded-tr-md",
													isLast && "rounded-bl-md rounded-br-md",
													!!!tm.minutesScaled && "!border-none"
												)}
												initial={{ height: 0 }}
												animate={{ height: tm.minutesScaled }}
												transition={{
													duration: 0.3,
													delay: tm.minutesScaled ? i * 0.05 : 0,
												}}
												style={{ backgroundColor: tm.color }}
											></motion.div>
										);
									})}
								</div>
							))}

							<div className="flex h-full flex-col justify-between">
								{[...Array(yNumbers)].map((_, i) => (
									<div className="text-xs leading-[80%]">
										{Math.round(min + yBetween * (yNumbers - i))}
									</div>
								))}
								<div className="text-xs leading-[80%]">0</div>
							</div>
						</div>
					</div>

					<div className="grid w-full grid-cols-8 gap-1 pt-1">
						{data?.map((d, i) => (
							<p key={d.date.toISOString()} className="text-center text-xs">
								{format(d.date, "EEEEE")}
							</p>
						))}
						<div className="text-[10px]">min</div>
					</div>

					<div className="flex flex-col gap-2">
						{scaled?.map((d) => (
							<div className="flex flex-col gap-1 text-sm">
								<p>{format(d.date, "EEEEEEE")}</p>

								<div className="flex flex-col gap-1">
									{d.tagMinutes.map((tm) => (
										<div className="flex items-center gap-1">
											<div
												className="h-2 w-2 rounded-full"
												style={{ backgroundColor: tm.color }}
											></div>
											<p>{tm.tag.label}</p>
											<p>{tm.minutes}</p>

											<div className="flex-1">
												<div
													className="h-1 rounded-full"
													style={{
														backgroundColor: tm.color,
														width: `${
															(tm.minutes / d.totalMinutes) * 100
														}%`,
													}}
												></div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</Layout>
	);
};

StatsPage.requireAuth = true;

export default StatsPage;
