import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { db } from "@/db/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { mapApiTagToDbTag, mapApiTaskToDbTask } from "@/utils/api/mapTypes";
import type { ApiTag, ApiTask } from "@/utils/api/types";
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

	const [canShowApp, setCanShowApp] = useState(!!localStorage.getItem("last-synced-at"));

	useEffect(() => {
		(async () => {
			const lastSyncedAt = localStorage.getItem("last-synced-at");
			const lastSyncedAtDate = lastSyncedAt ? new Date(lastSyncedAt) : undefined;

			const res = await apiRequest<{ tasks: ApiTask[]; tags: ApiTag[] }>({
				method: "GET",
				path: "/init",
				...(lastSyncedAtDate && {
					query: new URLSearchParams({ from: lastSyncedAtDate?.toISOString() }),
				}),
			});

			if (res) {
				localStorage.setItem("last-synced-at", new Date().toISOString());

				res.tags && (await db.tags.bulkPut(res.tags.map(mapApiTagToDbTag)));
				res.tasks && (await db.tasks.bulkPut(res.tasks.map(mapApiTaskToDbTask)));

				setCanShowApp(true);
			}
		})();
	}, []);

	// eslint-disable-next-line react-hooks/rules-of-hooks -- conditional is fine here
	!import.meta.env.PROD && useDevActions();

	return (
		<TimerContextProvider>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5, ease: "easeInOut" }}
			>
				<Routes>
					{canShowApp ? (
						<>
							<Route path="/app" element={<AppLayout />}>
								<Route index element={<AppIndexPage />} />
								<Route path="stats" element={<AppNumbersPage />} />
								<Route path="tags" element={<AppTagsPage />} />
								<Route path="tasks" element={<AppTasksPage />} />
								<Route path="settings" element={<AppSettingsPage />} />
							</Route>
							<Route path="*" element={<Navigate to="/app" />} />
						</>
					) : (
						<Route path="*" element={<Navigate to="/app" />} />
					)}
				</Routes>
			</motion.div>
		</TimerContextProvider>
	);
}
