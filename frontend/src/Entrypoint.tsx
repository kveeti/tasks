import { registerSW } from "virtual:pwa-register";

import { AuthenticatedApp } from "./pages/AuthenticatedApp";
import { UnauthenticatedApp } from "./pages/UnauthenticatedApp";
import { useAuth } from "./utils/useUser";

// const AuthenticatedApp = lazy(() =>
// 	import("./pages/AuthenticatedApp").then((m) => ({ default: m.AuthenticatedApp }))
// );

// const UnauthenticatedApp = lazy(() =>
// 	import("./pages/UnauthenticatedApp").then((m) => ({ default: m.UnauthenticatedApp }))
// );

export function Entrypoint() {
	const auth = useAuth();

	if (auth.isLoading) {
		return null;
	}

	return auth.data ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

if ("serviceWorker" in navigator) {
	registerSW();
}
