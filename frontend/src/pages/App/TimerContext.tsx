import differenceInSeconds from "date-fns/differenceInSeconds";
import { useLiveQuery } from "dexie-react-hooks";
import { type ReactNode, useEffect, useState } from "react";

import { type DbTaskWithTag, db } from "../../db/db";
import { createCtx } from "../../utils/createContext";
import { getMinutesAndSeconds } from "../../utils/formatSeconds";
import { useSetInterval } from "../../utils/useSetInterval";

const [useContextInner, Context] = createCtx<ReturnType<typeof useContextValue>>();

export const useTimerContext = useContextInner;

export function TimerContextProvider(props: { children: ReactNode }) {
	const contextValue = useContextValue();

	return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
}

function useContextValue() {
	const dbTags = useLiveQuery(() => db.tags.toArray());
	const dbActiveTasks = useLiveQuery(async () => {
		const now = new Date();

		const tasks = (
			await db.tasks.filter((task) => task.expires_at > now && !task.stopped_at).toArray()
		).map((task) => ({
			...task,
			tag: dbTags!.find((tag) => tag.id === task.tag_id)!,
		}));

		console.log({ tasks });

		return tasks;
	});

	const [activeTasks, setActiveTasks] = useState<ReturnType<typeof getTimes>>([]);
	const [selectedTagId, setSelectedTagId] = useState<string>();

	const selectedTag = dbTags?.find((tag) => tag.id === selectedTagId);

	function updateTimes() {
		if (dbActiveTasks) {
			setActiveTasks(getTimes(dbActiveTasks));
		}
	}

	useEffect(updateTimes, [dbActiveTasks]);
	useSetInterval(updateTimes, activeTasks.length ? 1000 : null);

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
		selectedTag,
		dbTags,
	};
}

function getTimes(activeTasks?: DbTaskWithTag[]) {
	return (
		activeTasks
			?.map((task) => {
				const timeUntilExpiryValue = differenceInSeconds(task.expires_at, new Date());

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
