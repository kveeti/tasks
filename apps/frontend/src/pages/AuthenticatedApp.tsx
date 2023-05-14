import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./App/AppLayout";
import { AppPage } from "./App/AppPage";
import { StatsPage } from "./App/StatsPage";
import { TagsPage } from "./App/TagsPage";

export function AuthenticatedApp() {
	return (
		<div className="fixed w-full h-full">
			<AppRoutes />
		</div>
	);
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/app" element={<AppLayout />}>
				<Route index element={<AppPage />} />
				<Route path="stats" element={<StatsPage />} />
				<Route path="tags" element={<TagsPage />} />
			</Route>

			<Route path="*" element={<Navigate to="/app" />} />
		</Routes>
	);
}
