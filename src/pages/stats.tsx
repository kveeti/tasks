import addWeeks from "date-fns/addWeeks";
import format from "date-fns/format";
import subWeeks from "date-fns/subWeeks";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

import { AnimatedChevron } from "~ui/AnimatedChevron";
import { Button } from "~ui/Button";
import { ErrorCard } from "~ui/ErrorCard";
import { ChevronLeft } from "~ui/Icons/ChevronLeft";
import { ChevronRight } from "~ui/Icons/ChevronRight";
import { Layout } from "~ui/Layout/Layout";
import type { Page } from "~utils/PageType";
import { classNames } from "~utils/classNames";
import { trpc } from "~utils/trpc";
import type { RouterOutputs } from "~utils/trpc";

const StatsPage: Page = () => {
	const [selectedWeek, setSelectedWeek] = useState(new Date());
	const { data, isLoading, error } = trpc.me.stats.daily.useQuery({ week: selectedWeek });

	const weekHasData = data?.hasData;

	return (
		<Layout>
			<h1 className="pb-10 text-4xl font-bold">Stats</h1>

			<div className="flex w-full flex-col gap-2 rounded-xl border border-p-700 bg-p-800 p-2">
				<div className="flex justify-between gap-2">
					<Button onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}>
						<ChevronLeft />
					</Button>
					<Button className="w-full text-sm">Week {format(selectedWeek, "I")}</Button>
					<Button onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}>
						<ChevronRight />
					</Button>
				</div>

				{isLoading ? (
					<div className="flex animate-pulse items-center justify-center rounded-md border border-p-600 bg-p-700 px-2 py-[5rem]">
						Loading...
					</div>
				) : error ? (
					<ErrorCard>
						<p>Failed to load stats</p>
					</ErrorCard>
				) : weekHasData ? (
					<Chart data={data.dailyStats} />
				) : (
					<div className="flex items-center justify-center rounded-md border border-p-600 bg-p-700 px-2 py-[5rem]">
						No data
					</div>
				)}

				{weekHasData && (
					<>
						<WeeklyTotal data={data.weeklyTotalMinutesPerTag} />

						<div className="flex flex-col gap-2">
							{data?.dailyStats.map((item, i) => (
								<WeekdayInfo key={i} data={item} />
							))}
						</div>
					</>
				)}
			</div>
		</Layout>
	);
};

type WeeklyTotalProps = {
	data: RouterOutputs["me"]["stats"]["daily"]["weeklyTotalMinutesPerTag"];
};

const WeeklyTotal = ({ data }: WeeklyTotalProps) => {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div
			className="flex flex-col rounded-md border border-p-600 bg-p-700 p-2"
			onClick={() => setIsOpen(!isOpen)}
		>
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-bold">Total</h2>

				<div className="rounded-md border border-p-500 bg-p-600 p-1">
					<AnimatedChevron open={isOpen} openByDefault />
				</div>
			</div>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						{data.map((d, i) => (
							<div key={i} className="flex items-center gap-2 pt-2">
								<div
									className={classNames("h-8 w-8 rounded-md")}
									style={{ backgroundColor: d.tag.color }}
								/>

								<div className="flex flex-col justify-between">
									<p>{d.tag.label}</p>
									<p>{d.minutes} min</p>
								</div>
							</div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

type WeekdayInfoProps = {
	data: RouterOutputs["me"]["stats"]["daily"]["dailyStats"][number];
};

const WeekdayInfo = ({ data }: WeekdayInfoProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	return (
		<div
			className="flex select-none flex-col rounded-md border border-p-600 bg-p-700 p-2"
			onClick={() => {
				setIsOpen(!isOpen);
				if (!isOpen) {
					setTimeout(() => {
						ref.current?.scrollIntoView({
							behavior: "auto",
							block: "center",
						});
					}, 200);
				}
			}}
			ref={ref}
		>
			<div className="flex items-center justify-between">
				<p>{format(data.date, "EEEEEEE")}</p>

				<div className="rounded-md border border-p-500 bg-p-600 p-1">
					<AnimatedChevron open={isOpen} />
				</div>
			</div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<div className="flex flex-col gap-2 pt-2">
							<p>Total: {data.totalMinutes} min</p>

							{data.tagMinutes.map((tm) => (
								<div key={tm.tag.id} className="flex items-center gap-2">
									<div
										className="h-8 w-8 rounded-md"
										style={{ backgroundColor: tm.tag.color }}
									/>

									<div className="flex flex-col">
										<p>{tm.tag.label}</p>
										<p>{tm.minutes} min</p>
									</div>
								</div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

const ChartWeekdays = () => {
	return (
		<div className="grid w-full grid-cols-8 gap-1">
			{["M", "T", "W", "T", "F", "S", "S"].map((weekday, i) => (
				<p key={i} className="text-center text-xs">
					{weekday}
				</p>
			))}
			<div className="text-[10px]">min</div>
		</div>
	);
};

type ChartProps = {
	data: RouterOutputs["me"]["stats"]["daily"]["dailyStats"];
};

const Chart = ({ data }: ChartProps) => {
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
		tagMinutes: d.tagMinutes.map((t) => ({
			...t,
			minutesScaled: Math.round(((t.minutes - min) / (max - min)) * (dmax - dmin) + dmin),
		})),
	}));

	return (
		<>
			<div className="flex flex-col gap-2 rounded-md border border-p-600 bg-p-700 p-2">
				<div className="grid h-[150px] w-full grid-cols-8 items-end justify-end gap-1">
					{scaled?.map((d, i) => (
						<div key={i} className="flex flex-col">
							{d.tagMinutes.map((tm, tmIndex) => {
								const isFirst = tmIndex === 0;
								const isLast =
									tmIndex ===
									d.tagMinutes.filter((tmi) => !!tmi.minutes).length - 1;

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
											duration: 0.2,
											delay: tm.minutesScaled ? i * 0.1 : 0,
										}}
										style={{ backgroundColor: tm.tag.color }}
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

				<ChartWeekdays />
			</div>
		</>
	);
};

StatsPage.requireAuth = true;

export default StatsPage;
