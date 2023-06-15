import { Navigate, Route, Routes } from "react-router-dom";

import { WithAnimation } from "./App/WithAnimation";
import { AuthLayout } from "./Auth/AuthLayout";
import { CallbackPage } from "./Auth/CallbackPage";
import { LoginPage } from "./Auth/LoginPage";

export function UnauthenticatedApp() {
	return (
		<WithAnimation>
			<div className="fixed h-full w-full">
				<Routes>
					<Route path="/auth" element={<AuthLayout />}>
						<Route path="login" element={<LoginPage />} />
						<Route path="callback" element={<CallbackPage />} />
					</Route>

					<Route path="*" element={<Navigate to="/auth/login" />} />
				</Routes>
			</div>
		</WithAnimation>
	);
}
