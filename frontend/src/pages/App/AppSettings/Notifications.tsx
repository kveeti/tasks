import { useMutation } from "@tanstack/react-query";
import { createToast } from "vercel-toast";

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
						createToast("Failed to turn on notifications", { type: "error" });
						return;
					}

					await addNotifSubMutation.mutateAsync({
						endpoint: subJson.endpoint,
						auth: subJson.keys.auth,
						p256dh: subJson.keys.p256dh,
					});

					createToast("Turned on notifications", { type: "success", timeout: 4000 });
				} else {
					createToast("You need to allow notifications to turn them on, crazy, right?", {
						timeout: 2000,
					});
				}
			}}
		>
			Turn on notifications
		</Button3>
	);
}

function urlBase64ToUint8Array(base64String: string) {
	var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

	var rawData = window.atob(base64);
	var outputArray = new Uint8Array(rawData.length);

	for (var i = 0; i < rawData.length; ++i) {
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
