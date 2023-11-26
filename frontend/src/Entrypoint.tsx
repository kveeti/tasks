import { lazy } from "react";
import { registerSW } from "virtual:pwa-register";

import { useAuth } from "./utils/api/auth";

const AuthenticatedApp = lazy(() =>
	import("./pages/AuthenticatedApp").then((m) => ({ default: m.AuthenticatedApp }))
);

const UnauthenticatedApp = lazy(() =>
	import("./pages/UnauthenticatedApp").then((m) => ({ default: m.UnauthenticatedApp }))
);

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
