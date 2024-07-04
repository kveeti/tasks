import { Navigate, Route, Routes } from "react-router-dom";

import { useNotifications } from "@/lib/hooks/use-notifications";

import { AppIndexPage } from "./app/app-index-page/app-index-page";
import { AppLayout } from "./app/app-layout/app-layout";
import { AppNumbersPage } from "./app/app-numbers-page/app-numbers-page";
import { AppSettingsPage } from "./app/app-settings-page/app-settings-page";
import { AppTagsPage } from "./app/app-tags-page/app-tags-page";
import { AppTasksPage } from "./app/app-tasks-page/app-tasks-page";
import { TimerContext } from "./app/timer-context";

export function AuthenticatedApp() {
	useNotifications();

	return (
		<TimerContext>
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
		</TimerContext>
	);
}

if ("serviceWorker" in navigator) {
	(async () => {
		console.debug("registering service worker...");
		await navigator.serviceWorker.register("/sw.js");
		console.debug("service worker registered");

		await navigator.serviceWorker.ready;
		console.debug("service worker ready");
	})();
}
