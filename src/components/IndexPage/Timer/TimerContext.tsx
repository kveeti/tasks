import differenceInSeconds from "date-fns/differenceInSeconds";
import { ReactNode, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import type { ApiTag } from "~types/apiTypes";
import { createCtx } from "~utils/createContext";
import { TWO_HOURS } from "~utils/times";
import { RouterOutputs, trpc } from "~utils/trpc";
import { useSetInterval } from "~utils/useSetInterval";

type TimerContextType = {
	time: number;
	isRunning: boolean;
	selectedTag: ApiTag | null;
	setSelectedTag: (tag: ApiTag) => void;
	isSubmitting: boolean;
	setIsSubmitting: (isSubmitting: boolean) => void;
	activeTaskExpiresAt: Date | null;
	startTimer: (expiresAt: Date) => void;
	stopTimer: () => void;
	addTime: (seconds: number) => void;
	subtractTime: (seconds: number) => void;
	tags: RouterOutputs["me"]["getMe"]["ownedTags"];

	minutes: string;
	seconds: string;

	isLoading: boolean;
	error: unknown;
};

const [useContextInner, Context] = createCtx<TimerContextType>();

export const useTimerContext = () => useContextInner();

type Props = { children: ReactNode };

export const TimerContextProvider = ({ children }: Props) => {
	const [time, setTime] = useState(0); // seconds
	const activeTaskExpiresAt = useRef<Date | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [selectedTag, setSelectedTag] = useState<ApiTag | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		data: me,
		isLoading,
		error,
	} = trpc.me.getMe.useQuery(undefined, {
		refetchInterval: 2500,
		refetchIntervalInBackground: false,
	});
	const tags = me?.ownedTags;
	const activeTask = me?.ownedTasks?.find((task) => task.isActive);

	useEffect(() => {
		if (!tags?.length) return;

		const tagToSet = tags.find((tag) => tag.was_last_used) || tags[0];
		if (!tagToSet) return;

		setSelectedTag(tagToSet);
	}, [tags]);

	useEffect(() => {
		if (activeTask) {
			activeTaskExpiresAt.current = activeTask.expiresAt;
		} else if (me && !activeTask) {
			stopTimer();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTask]);

	useSetInterval(
		() => {
			if (activeTaskExpiresAt.current) {
				setIsRunning(true);
				setNewTime(differenceInSeconds(activeTaskExpiresAt.current, new Date()));
			}
		},
		activeTaskExpiresAt ? 500 : null
	);

	const setNewTime = (newTime: number) => {
		if (newTime <= 0) {
			setIsRunning(false);
			activeTaskExpiresAt.current = null;
			setTime(0);
			return;
		}

		setTime(newTime);
	};

	const startTimer = (expiresAt: Date) => {
		setNewTime(time);
		activeTaskExpiresAt.current = expiresAt;
		setIsRunning(true);
	};

	const stopTimer = () => {
		setNewTime(0);
	};

	const addTime = (seconds: number) => {
		const newTime = time + seconds;

		if (time === TWO_HOURS) {
			return toast.error("You can't add more than 2 hours!");
		} else if (newTime > TWO_HOURS) {
			return setTime(TWO_HOURS);
		}

		setTime(newTime);
	};

	const subtractTime = (seconds: number) => {
		const newTime = time - seconds;

		if (newTime < 0) {
			setTime(0);
		} else {
			setTime(newTime);
		}
	};

	const minutes = String(Math.floor(time / 60)).padStart(2, "0");
	const seconds = String(time % 60).padStart(2, "0");

	return (
		<Context.Provider
			value={{
				time,
				isRunning,
				selectedTag,
				setSelectedTag,
				isSubmitting,
				setIsSubmitting,
				activeTaskExpiresAt: activeTaskExpiresAt.current,
				startTimer,
				stopTimer,
				addTime,
				subtractTime,
				tags,

				minutes,
				seconds,

				isLoading,
				error,
			}}
		>
			{children}
		</Context.Provider>
	);
};
