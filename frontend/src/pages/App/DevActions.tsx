import { addHours } from "date-fns";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import subDays from "date-fns/subDays";
import { toast } from "sonner";

import { db } from "@/db/db";
import { createId } from "@/utils/createId";
import { useHotkeys } from "@/utils/useHotkeys";

export function useDevActions() {
	const addTasks = useAddTasks();

	useHotkeys([
		["ctrl+alt+mod+o", addTasks],
		["ctrl+alt+mod+p", purge],
	]);
}

function useAddTasks() {
	return async () => {
		const now = new Date();

		const lastWeekToNowDays = eachDayOfInterval({
			start: subDays(now, 7),
			end: now,
		});

		toast.promise(
			async () => {
				const tag = (() => {
					const newTag = {
						id: createId(),
						color: "#fff",
						label: `Test-tag-${createId().slice(0, 5)}`,
						created_at: new Date(),
						updated_at: new Date(),
					};

					db.tags.add(newTag);

					return newTag;
				})();

				const tasks = lastWeekToNowDays.map((day) => ({
					id: createId(),
					tag_id: tag.id,
					created_at: day,
					updated_at: day,
					expires_at: addHours(day, 2),
					stopped_at: addHours(day, 1.8),
				}));

				await db.tasks.bulkAdd(tasks);
			},
			{
				loading: "Adding tasks...",
				success: "Added tasks",
				error: "Failed to add tasks",
			}
		);
	};
}

function purge() {
	db.delete();
	localStorage.clear();
	location.reload();
}
