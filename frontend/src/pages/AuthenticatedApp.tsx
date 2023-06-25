import { motion } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";

import { useSync } from "@/utils/Syncing";
import { NetworkStatusContextProvider } from "@/utils/networkStatus";
import { useNotifications } from "@/utils/useNotifications";

import { AppIndexPage } from "./App/AppIndexPage/AppIndexPage";
import { AppLayout } from "./App/AppLayout/AppLayout";
import { AppNumbersPage } from "./App/AppNumbersPage/AppNumbersPage";
import { AppSettingsPage } from "./App/AppSettings/AppSettings";
import { AppTagsPage } from "./App/AppTagsPage/AppTagsPage";
import { AppTasksPage } from "./App/AppTasksPage/AppTasksPage";
import { useDevActions } from "./App/DevActions";
import { TimerContextProvider } from "./App/TimerContext";

export function AuthenticatedApp() {
	useDevActions();
	useSync();

	useNotifications();

	return (
		<TimerContextProvider>
			<NetworkStatusContextProvider>
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
			</NetworkStatusContextProvider>
		</TimerContextProvider>
	);
}
