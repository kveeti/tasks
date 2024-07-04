import { useEffect } from "react";

import { conf } from "@/lib/conf";

import { apiRequest } from "../api/apiRequest";
import { urlBase64ToUint8Array } from "../urlBase64ToUint8Array";
import { useLocalStorage } from "./use-local-storage";

export const notificationsEnabledLocalStorageKey = "notifications-enabled";

export function useNotifications() {
	const [notificationEnabled, setNotificationsEnabled] = useLocalStorage(
		notificationsEnabledLocalStorageKey,
		"0"
	);
	const isNotificationsEnabled = notificationEnabled === "1";

	useEffect(() => {
		if (isNotificationsEnabled) return;

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
				applicationServerKey: urlBase64ToUint8Array(conf.VAPID_PUBLIC_KEY),
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
				.then(() => setNotificationsEnabled("1"));
		})();
	}, [isNotificationsEnabled, setNotificationsEnabled]);
}
