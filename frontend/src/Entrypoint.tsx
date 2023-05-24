import { lazy } from "react";
import { registerSW } from "virtual:pwa-register";

import { useUserId } from "./auth";

const AuthenticatedApp = lazy(() =>
	import("./pages/AuthenticatedApp").then((m) => ({ default: m.AuthenticatedApp }))
);

const UnauthenticatedApp = lazy(() =>
	import("./pages/UnauthenticatedApp").then((m) => ({ default: m.UnauthenticatedApp }))
);

export function Entrypoint() {
	const userId = useUserId();

	return userId ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

if ("serviceWorker" in navigator) {
	registerSW();
}
