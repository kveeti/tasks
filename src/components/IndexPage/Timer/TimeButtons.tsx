import { Button, SkeletonButton } from "~ui/Button";
import { Card } from "~ui/Card";
import { FIVE_MINUTES, HALF_HOUR } from "~utils/times";

type Props = {
	addTime: (timeToAdd: number) => void;
	subtractTime: (timeToSubstract: number) => void;
	disabled?: boolean;
};

export const TimeButtons = ({ addTime, subtractTime, disabled }: Props) => {
	return (
		<div className="grid w-full grid-cols-2 grid-rows-1 gap-2">
			<Card variant={1} className="rounded-xl">
				<div className="flex flex-col gap-2 p-2">
					<Button isDisabled={disabled} onPress={() => addTime(HALF_HOUR)}>
						+ 30 min
					</Button>
					<Button isDisabled={disabled} onPress={() => subtractTime(HALF_HOUR)}>
						- 30 min
					</Button>
				</div>
			</Card>

			<Card variant={1} className="rounded-xl">
				<div className="flex flex-col gap-2 p-2">
					<Button isDisabled={disabled} onPress={() => addTime(FIVE_MINUTES)}>
						+ 5 min
					</Button>
					<Button isDisabled={disabled} onPress={() => subtractTime(FIVE_MINUTES)}>
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
