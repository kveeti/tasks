import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/Ui/NewButton";
import { apiRequest } from "@/utils/api/apiRequest";
import { urlBase64ToUint8Array } from "@/utils/urlBase64ToUint8Array";

export function EnableNotifications() {
	const [enabled, setEnabled] = useState(localStorage.getItem("notifs-enabled") === "1");

	return (
		<Button
			className="p-3"
			isDisabled={enabled}
			onPress={async () =>
				toast.promise(enableNotifications, {
					error: (err) => {
						console.error("error enabling notifications:", err);
						return "error enabling notifications";
					},
					loading: "enabling notifications...",
					success: () => {
						setEnabled(true);
						return "notifications enabled";
					},
				})
			}
		>
			{enabled ? "notifications enabled" : "enable notifications"}
		</Button>
	);
}

async function enableNotifications() {
	const reg = await navigator.serviceWorker.getRegistration();
	if (!reg) {
		throw new Error("no service worker");
	}
	await navigator.serviceWorker.ready;

	const existingSub = await reg.pushManager.getSubscription();
	if (existingSub) {
		localStorage.setItem("notifs-enabled", "1");
		return;
	}

	const result = await createNotifSubscription(reg);

	if (result.error) {
		throw new Error(result.error);
	} else if (!result.data) {
		throw new Error("no data");
	}

	await apiRequest<void>({
		method: "POST",
		path: "/notif-subs",
		body: {
			endpoint: result.data.endpoint,
			auth: result.data.auth,
			p256dh: result.data.p256dh,
		},
	});
}

async function createNotifSubscription(reg: ServiceWorkerRegistration) {
	const result = await window.Notification.requestPermission();

	if (result !== "granted") {
		return { error: "permission denied" };
	}

	const subscription = await reg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUB_KEY),
	});

	const subJson = subscription.toJSON();

	if (!subJson.keys?.auth || !subJson.keys?.p256dh || !subJson.endpoint) {
		return { error: "invalid subscription" };
	}

	return {
		data: {
			endpoint: subJson.endpoint,
			auth: subJson.keys.auth,
			p256dh: subJson.keys.p256dh,
		},
	};
}
