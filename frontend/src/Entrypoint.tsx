import { registerSW } from "virtual:pwa-register";

import { AuthenticatedApp } from "./pages/authenticated-app";
import { UnauthenticatedApp } from "./pages/unauthenticated-app";
import { useAuth } from "./utils/api/auth";

export function Entrypoint() {
	const auth = useAuth();

	if (auth.isLoading) {
		return null;
	}

	return auth.data ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

if ("serviceWorker" in navigator) {
	console.debug("registering service worker");

	registerSW();
} else {
	console.warn("no service worker support");
}
