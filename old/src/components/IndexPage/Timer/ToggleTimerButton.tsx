import addSeconds from "date-fns/addSeconds";
import toast, { LoaderIcon } from "react-hot-toast";

import { Button } from "~ui/Button";
import { PlayIcon } from "~ui/Icons/PlayIcon";
import { StopIcon } from "~ui/Icons/StopIcon";
import { FIVE_MINUTES } from "~utils/times";
import { trpc } from "~utils/trpc";

import { useTimerContext } from "./TimerContext";

export const ToggleTimerButton = () => {
	const { isRunning, isSubmitting, setIsSubmitting, selectedTag, time, startTimer, stopTimer } =
		useTimerContext();

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

	return (
		<Button
			className="mt-7 w-full py-5"
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
	);
};
