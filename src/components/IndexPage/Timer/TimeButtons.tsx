import { Button, SkeletonButton } from "~ui/Button";
import { classNames } from "~utils/classNames";
import { FIVE_MINUTES, HALF_HOUR } from "~utils/times";

type Props = {
	addTime: (timeToAdd: number) => void;
	subtractTime: (timeToSubstract: number) => void;
	disabled?: boolean;
};

export const TimeButtons = ({ addTime, subtractTime, disabled }: Props) => {
	return (
		<div className="grid w-full grid-cols-2 grid-rows-1 gap-2">
			<div
				className={classNames(
					"flex flex-col gap-2 rounded-xl border  p-2",
					disabled
						? "border-primary-900 bg-primary-1200"
						: "border-primary-700 bg-primary-1100"
				)}
			>
				<Button isDisabled={disabled} onPress={() => addTime(HALF_HOUR)}>
					+ 30 min
				</Button>
				<Button isDisabled={disabled} onPress={() => subtractTime(HALF_HOUR)}>
					- 30 min
				</Button>
			</div>

			<div
				className={classNames(
					"flex flex-col gap-2 rounded-xl border  p-2",
					disabled
						? "border-primary-900 bg-primary-1200"
						: "border-primary-700 bg-primary-1100"
				)}
			>
				<Button isDisabled={disabled} onPress={() => addTime(FIVE_MINUTES)}>
					+ 5 min
				</Button>
				<Button isDisabled={disabled} onPress={() => subtractTime(FIVE_MINUTES)}>
					- 5 min
				</Button>
			</div>
		</div>
	);
};

export const SkeletonTimeButtons = () => {
	return (
		<div className="grid w-full grid-cols-2 grid-rows-1 gap-2">
			<div className="flex flex-col gap-2 rounded-xl border border-primary-700 bg-primary-800 p-2">
				<SkeletonButton />
				<SkeletonButton />
			</div>

			<div className="flex flex-col gap-2 rounded-xl border border-primary-700 bg-primary-800 p-2">
				<SkeletonButton />
				<SkeletonButton />
			</div>
		</div>
	);
};
