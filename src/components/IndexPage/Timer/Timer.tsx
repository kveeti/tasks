import differenceInMinutes from "date-fns/differenceInMinutes";
import { useEffect, useState } from "react";
import toast, { LoaderIcon } from "react-hot-toast";

import type { ApiTag } from "~types/apiTypes";
import { Button } from "~ui/Button";
import { PlayIcon } from "~ui/Icons/PlayIcon";
import { StopIcon } from "~ui/Icons/StopIcon";
import { classNames } from "~utils/classNames";
import { trpc } from "~utils/trpc";

import { CreateTag } from "./Tags/CreateTag/CreateTag";
import { SelectTag } from "./Tags/SelectTag";
import { SkeletonTimeButtons, TimeButtons } from "./TimeButtons";

export const Timer = () => {
	const [time, setTime] = useState(0); // minutes
	const [isRunning, setIsRunning] = useState(false);
	const [selectedTag, setSelectedTag] = useState<ApiTag | null>(null);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { data: me, isLoading, error } = trpc.me.getMe.useQuery();
	const tags = me?.ownedTags;
	const activeTask = me?.ownedTasks?.find((task) => task.isActive);

	useEffect(() => {
		if (!activeTask) {
			setIsRunning(false);
			setTime(0);
			return;
		}

		setIsRunning(true);

		setTime(differenceInMinutes(activeTask.expiresAt, new Date()));

		if (intervalId) return;

		const id = setInterval(
			() => setTime(differenceInMinutes(activeTask.expiresAt, new Date())),
			500
		);

		setIntervalId(id);

		return () => {
			clearInterval(id);
			setIntervalId(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTask]);

	const startMutation = trpc.me.tasks.createTask.useMutation();
	const stopMutation = trpc.me.tasks.stopTask.useMutation();

	const start = async () => {
		if (!selectedTag) {
			return toast.error("Please select a tag!");
		}

		if (time < 5) {
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

			setIsRunning(!isRunning);
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

			setIsRunning(!isRunning);
			setTime(0);
			intervalId && clearInterval(intervalId);
		} catch (err) {
			toast.error(err.message);
		}

		setIsSubmitting(false);
	};

	const addTime = (timeToAdd: number) => {
		if (time + timeToAdd > 120) return toast.error("You can't add more than 2 hours!");

		setTime(time + timeToAdd);
	};

	const subtractTime = (timeToSubtract: number) => {
		const newTime = time - timeToSubtract;

		if (newTime < 0) {
			setTime(0);
		} else {
			setTime(newTime);
		}
	};

	useEffect(() => {
		if (!tags?.length) return;

		const tagToSet = tags.find((tag) => tag.was_last_used) || tags[0];
		if (!tagToSet) return;

		setSelectedTag(tagToSet);
	}, [tags]);

	const minutes = Math.floor(time / 60).toString();
	const seconds = String(time % 60).padStart(2, "0");

	if (isLoading) return <SkeletonTimer />;
	if (error) return <div>Error</div>;
	if (!me) return <div>Something went wrong</div>;

	return (
		<div className="mx-auto flex w-full flex-col items-center justify-center gap-7">
			<div
				className={classNames(
					"before:animate-gradient-x before:animate-100s before:animate-infinite before:animate-linear relative z-[-1] w-full overflow-hidden rounded-[13px] p-[1px] before:absolute before:inset-0",
					isRunning ? "before:animate-my-pulse before:bg-p-400" : "before:bg-p-700"
				)}
			>
				<div className="relative flex h-full max-h-full w-full justify-center rounded-xl bg-p-800 py-1 px-6 text-[80px] font-bold">
					<h2
						className={classNames(
							"transition-[color] duration-200",
							!isRunning && "text-p-500"
						)}
					>
						<span>{minutes}</span>
						<span className={classNames(isRunning && "animate-second")}>.</span>
						<span>{seconds}</span>
					</h2>
				</div>
			</div>

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
				disabled={isSubmitting}
				onClick={() => (isRunning ? stop() : start())}
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
			<h2 className="flex w-full items-center justify-center rounded-xl border border-p-700 bg-p-800 py-1 px-6 text-[80px] font-bold text-p-500 transition-colors duration-200">
				--:--
			</h2>

			<SkeletonTimeButtons />

			<Button intent="skeleton" className="w-[5rem]">
				&nbsp;
			</Button>

			<Button intent="skeleton" className="w-full py-5">
				&nbsp;
			</Button>
		</div>
	);
};
