import { Button3 } from "../../Ui/Button";
import { trpc } from "../../api";
import { useUserId } from "../../auth";
import { db } from "../../db/db";
import { uuid } from "../../utils/uuid";

export function AppSettingsPage() {
	const userId = useUserId();
	const addNotifSubMutation = trpc.notifs.addSub.useMutation();

	return (
		<div className="flex flex-col gap-2 p-2">
			<Button3
				className="p-3"
				onPress={async () => {
					console.log("registering service worker");

					const registration = await navigator.serviceWorker.register("/notifs.js", {
						scope: "/",
					});

					console.log(registration);

					await navigator.serviceWorker.ready;

					console.log(Notification);

					const result = await Notification.requestPermission();

					if (result === "granted") {
						const subscription = await registration.pushManager.subscribe({
							userVisibleOnly: true,
							applicationServerKey: urlBase64ToUint8Array(
								"BJ-1I_gj6WS2XRyi4btN_V9I-hlJSuYO415rpw8T1-n03_mskX42OxMroj9gHouWy7OHE_2WmU33-Zqv3U5RnJc"
							),
						});

						const subJson = subscription.toJSON();

						if (!subJson.keys?.auth || !subJson.keys?.p256dh || !subJson.endpoint) {
							alert("no notifs for you");
							return;
						}

						await db.notifSubs.add({
							id: uuid(),
							userId,
							endpoint: subJson.endpoint,
							auth: subJson.keys.auth,
							p256dh: subJson.keys.p256dh,
							createdAt: new Date(),
						});

						await addNotifSubMutation.mutateAsync({
							endpoint: subJson.endpoint,
							auth: subJson.keys.auth,
							p256dh: subJson.keys.p256dh,
						});
					} else {
						alert("no notifs for you");
					}
				}}
			>
				Turn on notifications
			</Button3>
		</div>
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
