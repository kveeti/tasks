import { addHours } from "date-fns";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import subDays from "date-fns/subDays";
import { createToast } from "vercel-toast";

import { createId } from "@tasks/shared";

import { db } from "@/db/db";
import { useHotkeys } from "@/utils/useHotkeys";

export function useDevActions() {
	const addTasks = useAddTasks();

	useHotkeys([
		["mod+shift+o", addTasks],
		["mod+shift+p", purge],
	]);
}

function useAddTasks() {
	return async () => {
		const now = new Date();

		const lastWeekToNowDays = eachDayOfInterval({
			start: subDays(now, 7),
			end: now,
		});

		createToast("Adding tasks...", { timeout: 2000 });

		const tag = (() => {
			const newTag = {
				id: createId(),
				color: "#fff",
				label: `Test-tag-${createId().slice(0, 5)}`,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			db.tags.add(newTag);

			return newTag;
		})();

		const tasks = lastWeekToNowDays.map((day) => ({
			id: createId(),
			tagId: tag.id,
			createdAt: day,
			updatedAt: day,
			expiresAt: addHours(day, 2),
			stoppedAt: addHours(day, 1.8),
		}));

		await db.tasks.bulkAdd(tasks);

		createToast("Tasks added!", { type: "success", timeout: 2000 });
	};
}

function purge() {
	db.delete();
}
