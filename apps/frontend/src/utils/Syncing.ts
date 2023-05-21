import { trpc } from "@/api";
import { db } from "@/db/db";

import { useSetInterval } from "./useSetInterval";

export function Syncing() {
	const syncMutation = trpc.sync.sync.useMutation();

	useSetInterval(async () => {
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
	}, 10000);

	return null;
}
