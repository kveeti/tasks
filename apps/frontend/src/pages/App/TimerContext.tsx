import differenceInSeconds from "date-fns/differenceInSeconds";
import { useLiveQuery } from "dexie-react-hooks";
import { type ReactNode, useEffect, useState } from "react";

import { useUserId } from "../../auth";
import { type DbTask, db } from "../../db/db";
import { createCtx } from "../../utils/createContext";
import { getMinutesAndSeconds } from "../../utils/formatSeconds";
import { useSetInterval } from "../../utils/useSetInterval";

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

function getTimes(activeTasks?: DbTask[]) {
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
