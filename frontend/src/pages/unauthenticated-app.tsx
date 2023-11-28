import { motion } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";

import { CallbackPage } from "./auth/callback-page";
import { LoginPage } from "./auth/login-page";

export function UnauthenticatedApp() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.7, ease: "easeInOut" }}
			className="flex h-full w-full items-center justify-center"
		>
			<Routes>
				<Route path="/auth">
					<Route path="login" element={<LoginPage />} />
					<Route path="callback" element={<CallbackPage />} />
				</Route>

				<Route path="*" element={<Navigate to="/auth/login" />} />
			</Routes>
		</motion.div>
	);
}
