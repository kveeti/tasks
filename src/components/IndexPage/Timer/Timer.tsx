import addSeconds from "date-fns/addSeconds";
import toast, { LoaderIcon } from "react-hot-toast";

import { Button, SkeletonButton } from "~ui/Button";
import { Card } from "~ui/Card";
import { PlayIcon } from "~ui/Icons/PlayIcon";
import { StopIcon } from "~ui/Icons/StopIcon";
import { classNames } from "~utils/classNames";
import { FIVE_MINUTES } from "~utils/times";
import { trpc } from "~utils/trpc";

import { CreateTag } from "./Tags/CreateTag/CreateTag";
import { SelectTag } from "./Tags/SelectTag";
import { SkeletonTimeButtons, TimeButtons } from "./TimeButtons";
import { useTimerContext } from "./TimerContext";

export const Timer = () => {
	const {
		addTime,
		error,
		isLoading,
		isRunning,
		isSubmitting,
		setIsSubmitting,
		minutes,
		seconds,
		selectedTag,
		setSelectedTag,
		startTimer,
		stopTimer,
		subtractTime,
		tags,
		time,
	} = useTimerContext();

	const startMutation = trpc.me.tasks.createTask.useMutation();
	const stopMutation = trpc.me.tasks.stopTask.useMutation();

	const start = async () => {
		if (!selectedTag) {
			return toast.error("Please select a tag!");
		}

		if (time < FIVE_MINUTES) {
			return toast.error("Please set a time of at least 5 minutes!");
		}

		setIsSubmitting(true);

		try {
			await toast.promise(
				startMutation.mutateAsync({
					expires_after: time,
					tagId: selectedTag.id,
				}),
				{
					loading: "Starting...",
					success: "Started!",
					error: "Failed to start :(",
				}
			);

			startTimer(addSeconds(new Date(), time));
		} catch (err) {
			toast.error(err.message);
		}

		setIsSubmitting(false);
	};

	const stop = async () => {
		setIsSubmitting(true);

		try {
			await toast.promise(stopMutation.mutateAsync(), {
				loading: "Stopping...",
				success: "Stopped!",
				error: "Failed to stop :(",
			});

			stopTimer();
		} catch (err) {
			toast.error(err.message);
		}

		setIsSubmitting(false);
	};

	if (isLoading) return <SkeletonTimer />;
	if (error) return <div>Error</div>;

	return (
		<div className="mx-auto flex w-full flex-col items-center justify-center gap-7">
			<Card className="w-full rounded-xl">
				<div className="relative flex items-center justify-center p-2 text-[75px] font-bold">
					<h2
						className={classNames(
							"transition-[color] duration-200",
							!isRunning && "text-primary-500"
						)}
					>
						<span>{minutes}</span>
						<span className={classNames(isRunning && "animate-second")}>.</span>
						<span>{seconds}</span>
					</h2>
				</div>
			</Card>

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

			<Button
				className="w-full py-5"
				isDisabled={isSubmitting}
				onPress={() => (isRunning ? stop() : start())}
			>
				{isSubmitting ? (
					<LoaderIcon className="!h-6 !w-6" />
				) : isRunning ? (
					<StopIcon />
				) : (
					<PlayIcon />
				)}
			</Button>
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
