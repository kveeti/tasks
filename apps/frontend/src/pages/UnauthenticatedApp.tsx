import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./Auth/AuthLayout";
import { LoginPage } from "./Auth/LoginPage";
import { CallbackPage } from "./Auth/CallbackPage";

export function UnauthenticatedApp() {
	return (
		<div className="fixed w-full h-full">
			<AppRoutes />
		</div>
	);
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/auth" element={<AuthLayout />}>
				<Route path="login" element={<LoginPage />} />
				<Route path="callback" element={<CallbackPage />} />
			</Route>

			<Route path="*" element={<Navigate to="/auth/login" />} />
		</Routes>
	);
}
