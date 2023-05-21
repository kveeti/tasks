import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./App/AppLayout";
import { AppPage } from "./App/AppPage";
import { AppSettingsPage } from "./App/AppSettings/AppSettings";
import { useDevActions } from "./App/DevActions";
import { StatsPage } from "./App/StatsPage/StatsPage";
import { TagsPage } from "./App/TagsPage";

export function AuthenticatedApp() {
	useDevActions();

	return (
		<div className="fixed h-full w-full">
			<Routes>
				<Route path="/app" element={<AppLayout />}>
					<Route index element={<AppPage />} />
					<Route path="stats" element={<StatsPage />} />
					<Route path="tags" element={<TagsPage />} />
					<Route path="settings" element={<AppSettingsPage />} />
				</Route>
				<Route path="*" element={<Navigate to="/app" />} />
			</Routes>
		</div>
	);
}
