import { useState, type ReactNode, useEffect } from "react";
import { createCtx } from "../utils/createContext";
import differenceInSeconds from "date-fns/differenceInSeconds";
import { useSetInterval } from "../utils/useSetInterval";
import { db, type Task } from "../db/db";
import { getMinutesAndSeconds } from "../utils/formatSeconds";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "../utils/auth";

const [useContextInner, Context] = createCtx<ReturnType<typeof useContextValue>>();

export const useTimerContext = useContextInner;

export function TimerContext(props: { children: ReactNode }) {
	const contextValue = useContextValue();

	return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
}

function useContextValue() {
	const userId = useUserId();

	const dbActiveTasks = useLiveQuery(() => {
		const now = new Date();

		return db.tasks
			.filter((task) => task.userId === userId && task.expiresAt > now && !task.stoppedAt)
			.toArray();
	});

	const [activeTasks, setActiveTasks] = useState<ReturnType<typeof getTimes>>([]);
	const [selectedTagId, setSelectedTagId] = useState<string>();

	function updateTimes() {
		if (dbActiveTasks) {
			setActiveTasks(getTimes(dbActiveTasks));
		}
	}

	useEffect(updateTimes, [dbActiveTasks]);
	useSetInterval(updateTimes, !!activeTasks.length ? 1000 : null);

	useEffect(() => {
		if (activeTasks.length) {
			setSelectedTagId(activeTasks[0]!.tag.id);
		}
	}, [activeTasks]);

	const selectedTagTime = activeTasks.find((task) => task.tag.id === selectedTagId);

	return {
		activeTasks,
		selectedTagId,
		setSelectedTagId,
		selectedTagTime,
	};
}

function getTimes(activeTasks?: Task[]) {
	return (
		activeTasks
			?.map((task) => {
				const timeUntilExpiryValue = differenceInSeconds(task.expiresAt, new Date());

				return {
					id: task.id,
					tag: task.tag,
					timeUntilExpiryValue,
					timeUntilExpiry: getMinutesAndSeconds(timeUntilExpiryValue),
				};
			})
			.filter((task) => task.timeUntilExpiryValue > 0) ?? []
	);
}
