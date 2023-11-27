import { Navigate, Route, Routes } from "react-router-dom";

import { AuthLayout } from "./Auth/AuthLayout";
import { LoginPage } from "./Auth/LoginPage";

export function UnauthenticatedApp() {
	return (
		<div className="fixed h-full w-full">
			<Routes>
				<Route path="/auth" element={<AuthLayout />}>
					<Route path="login" element={<LoginPage />} />
				</Route>

				<Route path="*" element={<Navigate to="/auth/login" />} />
			</Routes>
		</div>
	);
}
