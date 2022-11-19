import { Button, SkeletonButton } from "~ui/Button";
import { classNames } from "~utils/classNames";

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
				<Button isDisabled={disabled} onPress={() => addTime(30)}>
					+ 30 min
				</Button>
				<Button isDisabled={disabled} onPress={() => subtractTime(30)}>
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
				<Button isDisabled={disabled} onPress={() => addTime(5)}>
					+ 5 min
				</Button>
				<Button isDisabled={disabled} onPress={() => subtractTime(5)}>
					- 5 min
				</Button>
			</div>
		</div>
	);
};

export const SkeletonTimeButtons = () => {
	return (
		<div className="grid w-full grid-cols-2 grid-rows-1 gap-2">
			<div className="border-primary-700 bg-primary-800 flex flex-col gap-2 rounded-xl border p-2">
				<SkeletonButton />
				<SkeletonButton />
			</div>

			<div className="border-primary-700 bg-primary-800 flex flex-col gap-2 rounded-xl border p-2">
				<SkeletonButton />
				<SkeletonButton />
			</div>
		</div>
	);
};
