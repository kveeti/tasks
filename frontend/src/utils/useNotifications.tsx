import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { apiRequest } from "./api/apiRequest";
import { urlBase64ToUint8Array } from "./urlBase64ToUint8Array";

export function useNotifications() {
	const addNotifSubMutation = useAddNotifSubMutation();

	useEffect(() => {
		(async () => {
			if (Notification.permission !== "granted") {
				return;
			}

			const reg = await navigator.serviceWorker.getRegistration();
			if (!reg) return;

			await navigator.serviceWorker.ready;

			const sub = await reg.pushManager.getSubscription();
			if (sub) {
				localStorage.setItem("notifs-enabled", "1");
				return;
			}

			const subscription = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUB_KEY),
			});

			const subJson = subscription.toJSON();

			if (!subJson.keys?.auth || !subJson.keys?.p256dh || !subJson.endpoint) {
				return;
			}

			await addNotifSubMutation
				.mutateAsync({
					endpoint: subJson.endpoint,
					auth: subJson.keys.auth,
					p256dh: subJson.keys.p256dh,
				})
				.catch(() => null);
		})();
	}, []);
}

function useAddNotifSubMutation() {
	return useMutation((body: { endpoint: string; auth: string; p256dh: string }) =>
		apiRequest<void>({
			method: "POST",
			path: "/notif-subs",
			body,
		})
	);
}
