import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { db } from "@/db/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { mapApiTagToDbTag, mapApiTaskToDbTask } from "@/utils/api/mapTypes";
import type { ApiTag, ApiTask } from "@/utils/api/types";
import { useLastSyncedAt } from "@/utils/useLastSyncedAt";
import { useNotifications } from "@/utils/useNotifications";
import { useWs } from "@/utils/ws";

import { AppIndexPage } from "./App/AppIndexPage/AppIndexPage";
import { AppLayout } from "./App/AppLayout/AppLayout";
import { AppNumbersPage } from "./App/AppNumbersPage/AppNumbersPage";
import { AppSettingsPage } from "./App/AppSettings/AppSettings";
import { AppTagsPage } from "./App/AppTagsPage/AppTagsPage";
import { AppTasksPage } from "./App/AppTasksPage/AppTasksPage";
import { useDevActions } from "./App/DevActions";
import { TimerContextProvider } from "./App/TimerContext";

export function AuthenticatedApp() {
	useNotifications();
	useWs();
	const { lastSyncedAt, setLastSyncedAt } = useLastSyncedAt();
	const [isAppReady, setIsAppReady] = useState(!!lastSyncedAt);

	const initQuery = useInitQuery(lastSyncedAt);

	useEffect(() => {
		(async () => {
			if (initQuery.isLoading) {
				return <div>syncing...</div>;
			} else if (initQuery.isError) {
				console.log(initQuery.error);

				return <div>error</div>;
			} else if (initQuery.data) {
				setLastSyncedAt(new Date().toISOString());

				initQuery.data.tags?.length &&
					(await db.tags.bulkPut(initQuery.data.tags.map(mapApiTagToDbTag)));
				initQuery.data.tasks?.length &&
					(await db.tasks.bulkPut(initQuery.data.tasks.map(mapApiTaskToDbTask)));

				setIsAppReady(true);
			}
		})();
	}, [initQuery.status]);

	async function syncNotSynced() {
		const notSynced = await db.notSynced.toArray();

		if (notSynced.length === 0) {
			return;
		}

		const notSyncedTaskIds = notSynced
			.filter((ns) => ns.target_type === "task")
			.map((ns) => ns.target_id);
		const notSyncedTagIds = notSynced
			.filter((ns) => ns.target_type === "tag")
			.map((ns) => ns.target_id);

		const notSyncedTasks = await db.tasks
			.filter((t) => notSyncedTaskIds.includes(t.id))
			.toArray();
		const notSyncedTags = await db.tags.filter((t) => notSyncedTagIds.includes(t.id)).toArray();

		await Promise.allSettled([
			apiRequest({
				method: "POST",
				path: "/tasks",
				body: notSyncedTasks,
			}),
			apiRequest({
				method: "POST",
				path: "/tags",
				body: notSyncedTags,
			}),
		]);
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks -- conditional is fine here
	!import.meta.env.PROD && useDevActions();

	return isAppReady ? (
		<TimerContextProvider>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5, ease: "easeInOut" }}
			>
				<Routes>
					<Route path="/app" element={<AppLayout />}>
						<Route index element={<AppIndexPage />} />
						<Route path="stats" element={<AppNumbersPage />} />
						<Route path="tags" element={<AppTagsPage />} />
						<Route path="tasks" element={<AppTasksPage />} />
						<Route path="settings" element={<AppSettingsPage />} />
					</Route>
					<Route path="*" element={<Navigate to="/app" />} />
				</Routes>
			</motion.div>
		</TimerContextProvider>
	) : (
		<div>syncing...</div>
	);
}

function useInitQuery(lastSyncedAt: Date | null) {
	return useQuery(["init"], () =>
		apiRequest<{ tasks: ApiTask[]; tags: ApiTag[] }>({
			method: "GET",
			path: "/init",
			...(lastSyncedAt && {
				query: new URLSearchParams({ from: lastSyncedAt?.toISOString() }),
			}),
		})
	);
}
