import format from "date-fns/format";
import { motion } from "framer-motion";

import { Card } from "~ui/Card";
import { classNames } from "~utils/classNames";
import type { RouterOutputs } from "~utils/trpc";

import type { WeekData } from "./WeekInfo";

type Props = {
	data: RouterOutputs["me"]["stats"]["monthly"];
	selectedInnerWeek: WeekData | null;
	setSelectedInnerWeek: (date: WeekData | null) => void;
};

export const ChartMonthly = ({ selectedInnerWeek, setSelectedInnerWeek, data }: Props) => {
	const min = Math.min(...(data?.monthlyStats.map((d) => d.totalMinutes) ?? []));
	const max = Math.max(...(data?.monthlyStats.map((d) => d.totalMinutes) ?? []));
	const dmin = 0;
	const dmax = 150;
	const range = max - min;
	const yNumbers = 4;
	const yBetween = range / yNumbers;

	const scaled = data?.monthlyStats?.map((d) => ({
		...d,
		totalMinutesScaled: Math.round(
			((d.totalMinutes - min) / (max - min)) * (dmax - dmin) + dmin
		),
		tagMinutes: d.tagMinutes.map((t) => ({
			...t,
			minutesScaled: Math.round(((t.minutes - min) / (max - min)) * (dmax - dmin) + dmin),
		})),
	}));

	return (
		<>
			<Card variant={2} className="mt-2 rounded-md">
				<div className="flex flex-col gap-2 p-2">
					<div className="grid h-[150px] w-full grid-cols-6 items-end justify-end gap-1">
						{scaled?.map((week, i) => (
							<div
								key={i}
								className="flex h-[150px] flex-col justify-end"
								onClick={() => {
									if (week.totalMinutes) {
										setSelectedInnerWeek(week);
									} else {
										setSelectedInnerWeek(null);
									}
								}}
							>
								{week.tagMinutes.map((tm, tmIndex) => {
									const isFirst = tmIndex === 0;
									const isLast =
										tmIndex ===
										week.tagMinutes.filter((tmi) => !!tmi.minutes).length - 1;

									return (
										<motion.div
											key={`${week.week.toISOString()}-${tm.tag.id}`}
											className={classNames(
												isFirst && "rounded-tl-md rounded-tr-md",
												isLast && "rounded-bl-md rounded-br-md",
												!!!tm.minutesScaled && "!border-none"
											)}
											initial={{ height: 0 }}
											animate={{ height: tm.minutesScaled }}
											transition={{
												duration: 0.2,
												delay: tm.minutesScaled ? i * 0.1 : 0,
											}}
											style={{
												backgroundColor: tm.tag.color,
												opacity: !selectedInnerWeek?.week
													? 1
													: week.week === selectedInnerWeek.week
													? 1
													: 0.3,
												filter: !selectedInnerWeek?.week
													? "unset"
													: week.week === selectedInnerWeek.week
													? "unset"
													: "grayscale(1)",
											}}
										/>
									);
								})}
							</div>
						))}

						<div className="flex h-full flex-col justify-between">
							{[...Array(yNumbers)].map((_, i) => (
								<div key={i} className="text-xs leading-[80%]">
									{Math.round(min + yBetween * (yNumbers - i))}
								</div>
							))}
							<div className="text-xs leading-[80%]">0</div>
						</div>
					</div>

					<div className="grid w-full grid-cols-6 gap-1">
						{data?.monthlyStats.map((d, i) => (
							<p key={i} className="text-center text-[0.7rem]">
								w {format(d.week, "I", { weekStartsOn: 1 })}
							</p>
						))}
						<div className="text-[10px]">min</div>
					</div>
				</div>
			</Card>
		</>
	);
};
