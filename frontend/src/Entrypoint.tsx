import { lazy, useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

import { db } from "./db/db";
import { useUser } from "./utils/useUser";

const AuthenticatedApp = lazy(() =>
	import("./pages/AuthenticatedApp").then((m) => ({ default: m.AuthenticatedApp }))
);

const UnauthenticatedApp = lazy(() =>
	import("./pages/UnauthenticatedApp").then((m) => ({ default: m.UnauthenticatedApp }))
);

export function Entrypoint() {
	const user = useUser();

	useEffect(() => {
		db.open();
	}, []);

	return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

if ("serviceWorker" in navigator) {
	registerSW();
}
