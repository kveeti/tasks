import { useEffect } from "react";

import { apiRequest } from "./api/apiRequest";
import { urlBase64ToUint8Array } from "./urlBase64ToUint8Array";

export function useNotifications() {
	useEffect(() => {
		(async () => {
			if (Notification.permission !== "granted") {
				console.debug("useNotifications no permission");

				return;
			}

			const reg = await navigator.serviceWorker.getRegistration();
			if (!reg) return;

			await navigator.serviceWorker.ready;

			const sub = await reg.pushManager.getSubscription();
			if (!sub) {
				console.debug("useNotifications no subscription");
				return;
			}

			const subscription = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_APP_VAPID_PUB_KEY),
			});

			const subJson = subscription.toJSON();

			if (!subJson.keys?.auth || !subJson.keys?.p256dh || !subJson.endpoint) {
				return;
			}

			apiRequest<void>({
				method: "POST",
				path: "/notif-subs",
				body: {
					endpoint: subJson.endpoint,
					auth: subJson.keys.auth,
					p256dh: subJson.keys.p256dh,
				},
			})
				.catch(() => null)
				.then(() => localStorage.setItem("notifs-enabled", "1"));
		})();
	}, []);
}
