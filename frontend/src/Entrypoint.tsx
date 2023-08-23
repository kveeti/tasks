import { lazy } from "react";
import { registerSW } from "virtual:pwa-register";

import { useUser } from "./auth";

const AuthenticatedApp = lazy(() =>
	import("./pages/AuthenticatedApp").then((m) => ({ default: m.AuthenticatedApp }))
);

const UnauthenticatedApp = lazy(() =>
	import("./pages/UnauthenticatedApp").then((m) => ({ default: m.UnauthenticatedApp }))
);

export function Entrypoint() {
	const user = useUser();

	return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

if ("serviceWorker" in navigator) {
	registerSW();
}
