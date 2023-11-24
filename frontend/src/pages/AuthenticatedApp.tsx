import { motion } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";

import { useOnGoingTask } from "@/utils/api/tasks";
import { useNotifications } from "@/utils/use-notifications";

import { AppIndexPage } from "./App/AppIndexPage/app-index-page";
import { AppLayout } from "./App/AppLayout/AppLayout";
import { AppNumbersPage } from "./App/app-numbers-page/app-numbers-page";
import { AppSettingsPage } from "./App/app-settings-page/app-settings-page";
import { AppTagsPage } from "./App/app-tags-page/app-tags-page";
import { AppTasksPage } from "./App/app-tasks-page/app-tasks-page";
import { TimerContext } from "./App/timer-context";

export function AuthenticatedApp() {
	useNotifications();

	const { isLoading } = useOnGoingTask();

	if (isLoading) {
		return null;
	}

	return (
		<TimerContext>
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
		</TimerContext>
	);
}
