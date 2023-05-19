import { addHours } from "date-fns";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import subDays from "date-fns/subDays";
import { createToast } from "vercel-toast";

import { createId } from "@tasks/shared";

import { useUserId } from "@/auth";
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
	const userId = useUserId();

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
				userId,
				createdAt: new Date(),
			};

			db.tags.add(newTag);

			return newTag;
		})();

		const tasks = lastWeekToNowDays.map((day) => ({
			id: createId(),
			tagId: tag.id,
			userId,
			createdAt: day,
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
