import { motion } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";

import { useSyncing } from "@/utils/Syncing";

import { AppIndexPage } from "./App/AppIndexPage/AppIndexPage";
import { AppLayout } from "./App/AppLayout";
import { AppNumbersPage } from "./App/AppNumbersPage/AppNumbersPage";
import { AppTagsPage } from "./App/AppTagsPage/AppTagsPage";
import { useDevActions } from "./App/DevActions";
import { TimerContextProvider } from "./App/TimerContext";

export function AuthenticatedApp() {
	useDevActions();
	useSyncing();

	return (
		<TimerContextProvider>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
			>
				<Routes>
					<Route path="/app" element={<AppLayout />}>
						<Route index element={<AppIndexPage />} />
						<Route path="stats" element={<AppNumbersPage />} />
						<Route path="tags" element={<AppTagsPage />} />
						<Route path="settings" element={<div />} />
					</Route>
					<Route path="*" element={<Navigate to="/app" />} />
				</Routes>
			</motion.div>
		</TimerContextProvider>
	);
}
