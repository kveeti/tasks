import { Navigate, Route, Routes } from "react-router-dom";

import { CallbackPage } from "./auth/callback-page";
import { LoginPage } from "./auth/login-page";

export function UnauthenticatedApp() {
	return (
		<Routes>
			<Route path="/auth">
				<Route path="login" element={<LoginPage />} />
				<Route path="callback" element={<CallbackPage />} />
			</Route>

			<Route path="*" element={<Navigate to="/auth/login" />} />
		</Routes>
	);
}
