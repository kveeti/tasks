import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button3 } from "@/Ui/Button";
import { apiRequest } from "@/utils/api/apiRequest";

export function TurnOnNotifications() {
	const addNotifSubMutation = useAddNotifSubMutation();

	return (
		<Button3
			className="p-3"
			onPress={async () => {
				const reg = await navigator.serviceWorker.register("/notifs.js", {
					scope: "/",
				});

				await navigator.serviceWorker.ready;

				const result = await window.Notification.requestPermission();

				if (result === "granted") {
					const subscription = await reg.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: urlBase64ToUint8Array(
							"BJ-1I_gj6WS2XRyi4btN_V9I-hlJSuYO415rpw8T1-n03_mskX42OxMroj9gHouWy7OHE_2WmU33-Zqv3U5RnJc"
						),
					});

					const subJson = subscription.toJSON();

					if (!subJson.keys?.auth || !subJson.keys?.p256dh || !subJson.endpoint) {
						toast.error("Failed to turn on notifications");
						return;
					}

					await addNotifSubMutation
						.mutateAsync({
							endpoint: subJson.endpoint,
							auth: subJson.keys.auth,
							p256dh: subJson.keys.p256dh,
						})
						.then(() => toast.success("Turned on notifications"))
						.catch(() => toast.error("Failed to turn on notifications"));
				} else {
					toast.error("You need to allow notifications to turn them on, crazy, right?");
				}
			}}
		>
			Turn on notifications
		</Button3>
	);
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
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
