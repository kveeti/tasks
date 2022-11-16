import { Button } from "~ui/Button";

type Props = {
	addTime: (timeToAdd: number) => void;
	subtractTime: (timeToSubstract: number) => void;
	disabled?: boolean;
};

export const TimeButtons = ({ addTime, subtractTime, disabled }: Props) => {
	return (
		<div className="grid w-full grid-cols-2 grid-rows-1 gap-2">
			<div className="flex flex-col gap-2 rounded-xl border border-p-700 bg-p-800 p-2">
				<Button disabled={disabled} onClick={() => addTime(30)}>
					+ 30 min
				</Button>
				<Button disabled={disabled} onClick={() => subtractTime(30)}>
					- 30 min
				</Button>
			</div>

			<div className="flex flex-col gap-2 rounded-xl border border-p-700 bg-p-800 p-2">
				<Button disabled={disabled} onClick={() => addTime(5)}>
					+ 5 min
				</Button>
				<Button disabled={disabled} onClick={() => subtractTime(5)}>
					- 5 min
				</Button>
			</div>
		</div>
	);
};

export const SkeletonTimeButtons = () => {
	return (
		<div className="grid w-full grid-cols-2 grid-rows-1 gap-2">
			<div className="flex flex-col gap-2 rounded-xl border border-p-700 bg-p-800 p-2">
				<Button disabled>&nbsp;</Button>
				<Button disabled>&nbsp;</Button>
			</div>

			<div className="flex flex-col gap-2 rounded-xl border border-p-700 bg-p-800 p-2">
				<Button disabled>&nbsp;</Button>
				<Button disabled>&nbsp;</Button>
			</div>
		</div>
	);
};
