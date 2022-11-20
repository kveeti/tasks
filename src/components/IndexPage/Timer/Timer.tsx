import { SkeletonButton } from "~ui/Button";

import { CreateTag } from "./Tags/CreateTag/CreateTag";
import { SelectTag } from "./Tags/SelectTag";
import { Time } from "./Time";
import { SkeletonTimeButtons, TimeButtons } from "./TimeButtons";
import { useTimerContext } from "./TimerContext";
import { ToggleTimerButton } from "./ToggleTimerButton";

export const Timer = () => {
	const {
		addTime,
		error,
		isLoading,
		isRunning,
		selectedTag,
		setSelectedTag,
		subtractTime,
		tags,
	} = useTimerContext();

	if (isLoading) return <SkeletonTimer />;
	if (error) return <div>Error</div>;

	return (
		<div className="mx-auto flex w-full flex-col items-center justify-center gap-7">
			<Time />

			<TimeButtons disabled={isRunning} addTime={addTime} subtractTime={subtractTime} />

			{tags?.length ? (
				<SelectTag
					disabled={isRunning}
					setSelectedTag={setSelectedTag}
					selectedTag={selectedTag}
					tags={tags}
				/>
			) : (
				<CreateTag />
			)}

			<ToggleTimerButton />
		</div>
	);
};

const SkeletonTimer = () => {
	return (
		<div className="mx-auto flex w-full animate-pulse flex-col items-center justify-center gap-7">
			<h2 className="flex w-full items-center justify-center rounded-xl border border-primary-700 bg-primary-800 py-1 px-6 text-[80px] font-bold text-primary-500 transition-colors duration-200">
				--:--
			</h2>

			<SkeletonTimeButtons />

			<SkeletonButton className="w-[5rem]" />

			<SkeletonButton className="w-full py-5" />
		</div>
	);
};
