import { SkeletonButton } from "~ui/Button";

import { CreateTag } from "./Tags/CreateTag/CreateTag";
import { SelectTag } from "./Tags/SelectTag";
import { SkeletonTime, Time } from "./Time";
import { SkeletonTimeButtons, TimeButtons } from "./TimeButtons";
import { useTimerContext } from "./TimerContext";
import { ToggleTimerButton } from "./ToggleTimerButton";

export const Timer = () => {
	const { error, isLoading, tags } = useTimerContext();

	if (isLoading) return <SkeletonTimer />;
	if (error) return <div>Error</div>;

	return (
		<div className="mx-auto flex w-full flex-col items-center justify-center gap-7">
			<Time />

			<TimeButtons />

			{tags?.length ? <SelectTag /> : <CreateTag />}

			<ToggleTimerButton />
		</div>
	);
};

const SkeletonTimer = () => {
	return (
		<div className="mx-auto flex w-full animate-pulse flex-col items-center justify-center gap-7">
			<SkeletonTime />

			<SkeletonTimeButtons />

			<SkeletonButton className="w-[5rem]" />

			<SkeletonButton className="w-full py-5" />
		</div>
	);
};
