import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

import { useAuth } from "./lib/api/auth";
import { AuthenticatedApp } from "./pages/authenticated-app";
import { UnauthenticatedApp } from "./pages/unauthenticated-app";

export function Entrypoint() {
	const auth = useAuth();

	if (auth.isLoading) {
		return null;
	}

	return (
		<BrowserRouter>
			<AnimatePresence mode="wait">
				{auth.data ? (
					<PageWrap key="auth">
						<AuthenticatedApp />
					</PageWrap>
				) : (
					<PageWrap key="unauth">
						<UnauthenticatedApp />
					</PageWrap>
				)}
			</AnimatePresence>
		</BrowserRouter>
	);
}

function PageWrap(props: { children: ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0, transition: { duration: 0.5 } }}
			transition={{ duration: 0.7, ease: "easeInOut" }}
			className="flex h-full w-full items-center justify-center"
		>
			{props.children}
		</motion.div>
	);
}
