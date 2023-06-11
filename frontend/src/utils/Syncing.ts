import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { type DbTag, type DbTask, db } from "@/db/db";

import { apiRequest } from "./api/apiRequest";
import type { ApiTag, ApiTask } from "./api/types";
import { useSetInterval } from "./useSetInterval";

export function useSyncing() {
	const syncMutation = useMutation(
		(syncBody: { last_synced_at: Date | null; tasks: DbTask[]; tags: DbTag[] }) =>
			apiRequest<{ tags: ApiTag[]; tasks: ApiTask[] }>({
				method: "POST",
				path: "/sync",
				body: syncBody,
			})
	);

	async function sync() {
		const storageLastSyncedAt = localStorage.getItem("lastSyncedAt");
		const lastSyncedAt = storageLastSyncedAt ? new Date(storageLastSyncedAt) : null;

		const tasksNotSynced = lastSyncedAt
			? await db.tasks
					.filter((t) => t.created_at >= lastSyncedAt || t.updated_at >= lastSyncedAt)
					.toArray()
			: await db.tasks.toArray();

		const tagsNotSynced = lastSyncedAt
			? await db.tags
					.filter((t) => t.created_at >= lastSyncedAt || t.updated_at >= lastSyncedAt)
					.toArray()
			: await db.tags.toArray();

		const { tags, tasks } = await syncMutation.mutateAsync({
			last_synced_at: lastSyncedAt ? new Date(lastSyncedAt) : null,
			tasks: tasksNotSynced,
			tags: tagsNotSynced,
		});

		if (tags.length > 0) {
			await db.tags.bulkPut(
				tags.map((t) => ({
					...t,
					created_at: new Date(t.created_at),
					updated_at: new Date(t.updated_at),
				}))
			);
		}

		if (tasks.length > 0) {
			await db.tasks.bulkPut(
				tasks.map((t) => ({
					...t,
					created_at: new Date(t.created_at),
					updated_at: new Date(t.updated_at),
					expires_at: new Date(t.expires_at),
					stopped_at: t.stopped_at ? new Date(t.stopped_at) : null,
				}))
			);
		}

		localStorage.setItem("lastSyncedAt", new Date().toISOString());
	}

	useSetInterval(sync, 10000);
	useEffect(() => {
		sync();
	}, []);
}
