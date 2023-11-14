import { motion } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";

import { useNotifications } from "@/utils/useNotifications";

import { AppIndexPage } from "./App/AppIndexPage/AppIndexPage";
import { AppLayout } from "./App/AppLayout/AppLayout";
import { AppNumbersPage } from "./App/AppNumbersPage/AppNumbersPage";
import { AppSettingsPage } from "./App/AppSettings/AppSettings";
import { useDevActions } from "./App/DevActions";
import { TimerContextProvider } from "./App/TimerContext";
import { AppTagsPage } from "./App/app-tags-page/app-tags-page";
import { AppTasksPage } from "./App/app-tasks-page/app-tasks-page";

export function AuthenticatedApp() {
	useNotifications();

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
	);
}
