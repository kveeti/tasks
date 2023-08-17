import { type DbTag, type DbTask, addManyNotSynced } from "@/db/db";

import { apiRequest } from "./apiRequest";

export async function tryPutTasks(tasks: DbTask[]) {
	try {
		await apiRequest({
			method: "PUT",
			path: "/tasks",
			body: tasks,
		});
	} catch (err) {
		console.log("tried putting tasks - failed - adding to not synced...");

		await addManyNotSynced(
			tasks.map((task) => ({ target_id: task.id, target_type: "task" }))
		).catch(() => {
			console.error("failed to add not synced tasks to local db!");
		});
	}
}

export async function tryPutTags(tags: DbTag[]) {
	try {
		await apiRequest({
			method: "PUT",
			path: "/tags",
			body: tags,
		});
	} catch (err) {
		console.log("tried putting tags - failed - adding to not synced...");

		await addManyNotSynced(
			tags.map((task) => ({ target_id: task.id, target_type: "tag" }))
		).catch(() => {
			console.error("failed to add not synced tags to local db!");
		});
	}
}
