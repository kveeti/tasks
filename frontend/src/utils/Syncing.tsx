import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { db } from "@/db/db";

import { apiRequest } from "./api/apiRequest";
import type { ApiTag, ApiTask } from "./api/types";
import { createCtx } from "./createContext";
import { useSetInterval } from "./useSetInterval";

const [useContextInner, Context] = createCtx<ReturnType<typeof useContextValue>>();

export const useSyncing = useContextInner;

function useContextValue() {
	const [isSyncingEnabled, setIsSyncingEnabled] = useState(false);
    const abortControllerRef = useRef<AbortController >(new AbortController());

    function disableSync() {
        setIsSyncingEnabled(false); 
        abortControllerRef.current.abort();
    }

    function enableSync() {
        setIsSyncingEnabled(true); 
        abortControllerRef.current = new AbortController();
    }
    
    function sync() {
        return  isSyncingEnabled ? _sync({signal: abortControllerRef.current.signal}) : Promise.resolve();
    } 

	return {
		isSyncingEnabled,
        disableSync,
        enableSync,
        sync
	};
}

export function SyncingContextProvider(props: { children: React.ReactNode }) {
	const value = useContextValue();

	return <Context.Provider value={value}>{props.children}</Context.Provider>;
}

export function useSync() {
	const { sync } = useSyncing();

	useSetInterval(sync, 5000);
	useEffect(() => {
		sync();
	}, []);
}

 async function _sync(props: {signal: AbortSignal}) {
	const storageLastSyncedAt = localStorage.getItem("lastSyncedAt");
	const lastSyncedAt = storageLastSyncedAt ? new Date(storageLastSyncedAt) : null;

	const notSynced = await db.notSynced.toArray();

	const notSyncedTaskIds = notSynced
		.filter((ns) => ns.target_type === "task")
		.map((ns) => ns.target_id);
	const notSyncedTagIds = notSynced
		.filter((ns) => ns.target_type === "tag")
		.map((ns) => ns.target_id);

	const notSyncedTasks = await db.tasks.filter((t) => notSyncedTaskIds.includes(t.id)).toArray();
	const notSyncedTags = await db.tags.filter((t) => notSyncedTagIds.includes(t.id)).toArray();

	const { tags, tasks } = await apiRequest<{ tags: ApiTag[]; tasks: ApiTask[] }>({
		method: "POST",
		path: "/sync",
		body: {
			last_synced_at: lastSyncedAt ? lastSyncedAt : null,
			tasks: notSyncedTasks,
			tags: notSyncedTags,
		},
        signal: props.signal
	});

	if (tags.length > 0) {
		await db.tags.bulkPut(
			tags.map((t) => ({
				...t,
				created_at: new Date(t.created_at),
				updated_at: new Date(t.updated_at),
				deleted_at: t.deleted_at ? new Date(t.deleted_at) : null,
			}))
		);
	}

	const promises = [];

	if (tasks.length > 0) {
		promises.push(
			db.tasks.bulkPut(
				tasks.map((t) => ({
					...t,
					started_at: new Date(t.started_at),
					created_at: new Date(t.created_at),
					updated_at: new Date(t.updated_at),
					expires_at: new Date(t.expires_at),
					stopped_at: t.stopped_at ? new Date(t.stopped_at) : null,
					deleted_at: t.deleted_at ? new Date(t.deleted_at) : null,
				}))
			)
		);
	}

	promises.push(db.notSynced.bulkDelete(notSynced.map((ns) => ns.id)));
	await Promise.all(promises);

	localStorage.setItem("lastSyncedAt", new Date().toISOString());
}
