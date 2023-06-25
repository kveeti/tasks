import { Card, SkeletonCard } from "~ui/Card";
import { classNames } from "~utils/classNames";

import { useTimerContext } from "./TimerContext";

export const Time = () => {
	const { minutes, seconds, isRunning } = useTimerContext();

	return (
		<Card className="w-full rounded-xl">
			<div className="relative flex items-center justify-center p-2 text-[75px] font-bold">
				<h2
					className={classNames(
						"transition-[color] duration-200",
						!isRunning && "text-gray-500"
					)}
				>
					<span>{minutes}</span>
					<span className={classNames(isRunning && "animate-second")}>:</span>
					<span>{seconds}</span>
				</h2>
			</div>
		</Card>
	);
};

export const SkeletonTime = () => {
	return (
		<SkeletonCard className="w-full rounded-xl">
			<div className="relative flex items-center justify-center p-2 text-[75px] font-bold">
				<h2 className="text-gray-500">--:--</h2>
			</div>
		</SkeletonCard>
	);
};
