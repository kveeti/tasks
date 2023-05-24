import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { type DbTag, type DbTask, db } from "@/db/db";

import { apiRequest } from "./api/apiRequest";
import { useSetInterval } from "./useSetInterval";

export function Syncing() {
	const syncMutation = useMutation(
		(syncBody: { lastSyncedAt: Date | null; tasks: DbTask[]; tags: DbTag[] }) =>
			apiRequest<{ tags: DbTag[]; tasks: DbTask[] }>({
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
					.filter((t) => t.createdAt >= lastSyncedAt || t.updatedAt >= lastSyncedAt)
					.toArray()
			: await db.tasks.toArray();

		const tagsNotSynced = lastSyncedAt
			? await db.tags
					.filter((t) => t.createdAt >= lastSyncedAt || t.updatedAt >= lastSyncedAt)
					.toArray()
			: await db.tags.toArray();

		const { tags, tasks } = await syncMutation.mutateAsync({
			lastSyncedAt: lastSyncedAt ? new Date(lastSyncedAt) : null,
			tasks: tasksNotSynced,
			tags: tagsNotSynced,
		});

		if (tags.length > 0) {
			await db.tags.bulkPut(tags);
		}

		if (tasks.length > 0) {
			await db.tasks.bulkPut(tasks);
		}

		localStorage.setItem("lastSyncedAt", new Date().toISOString());
	}

	useSetInterval(sync, 10000);
	useEffect(() => {
		sync();
	}, []);

	return null;
}
