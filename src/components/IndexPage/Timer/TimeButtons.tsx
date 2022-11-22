import { Button, SkeletonButton } from "~ui/Button";
import { Card } from "~ui/Card";
import { FIVE_MINUTES, HALF_HOUR } from "~utils/times";

import { useTimerContext } from "./TimerContext";

export const TimeButtons = () => {
	const { addTime, subtractTime, isRunning } = useTimerContext();

	return (
		<div className="grid w-full grid-cols-2 grid-rows-1 gap-2">
			<Card variant={1} className="rounded-xl">
				<div className="flex flex-col gap-2 p-2">
					<Button disabled={isRunning} onClick={() => addTime(HALF_HOUR)}>
						+ 30 min
					</Button>
					<Button disabled={isRunning} onClick={() => subtractTime(HALF_HOUR)}>
						- 30 min
					</Button>
				</div>
			</Card>

			<Card variant={1} className="rounded-xl">
				<div className="flex flex-col gap-2 p-2">
					<Button disabled={isRunning} onClick={() => addTime(FIVE_MINUTES)}>
						+ 5 min
					</Button>
					<Button disabled={isRunning} onClick={() => subtractTime(FIVE_MINUTES)}>
						- 5 min
					</Button>
				</div>
			</Card>
		</div>
	);
};

export const SkeletonTimeButtons = () => {
	return (
		<div className="grid w-full grid-cols-2 grid-rows-1 gap-2">
			<Card variant={1} className="rounded-xl">
				<div className="flex flex-col gap-2 p-2">
					<SkeletonButton />
					<SkeletonButton />
				</div>
			</Card>
			<Card variant={1} className="rounded-xl">
				<div className="flex flex-col gap-2 p-2">
					<SkeletonButton />
					<SkeletonButton />
				</div>
			</Card>
		</div>
	);
};
