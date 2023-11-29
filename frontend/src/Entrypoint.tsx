import { AnimatePresence, motion } from "framer-motion";
import { registerSW } from "virtual:pwa-register";

import { AuthenticatedApp } from "./pages/authenticated-app";
import { UnauthenticatedApp } from "./pages/unauthenticated-app";
import { useAuth } from "./utils/api/auth";

export function Entrypoint() {
	const auth = useAuth();

	if (auth.isLoading) {
		return null;
	}

	return (
		<AnimatePresence mode="wait">
			{auth.data ? (
				<motion.div
					key="app"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.7, ease: "easeInOut" }}
					className="flex h-full w-full items-center justify-center"
				>
					<AuthenticatedApp />
				</motion.div>
			) : (
				<motion.div
					key="auth"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0, transition: { duration: 0.5 } }}
					transition={{ duration: 0.7, ease: "easeInOut" }}
					className="flex h-full w-full items-center justify-center"
				>
					<UnauthenticatedApp />
				</motion.div>
			)}
		</AnimatePresence>
	);
}

if ("serviceWorker" in navigator) {
	console.debug("registering service worker");

	registerSW();
} else {
	console.warn("no service worker support");
}
