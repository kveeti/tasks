import { useState } from "react";
import { toast } from "sonner";

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/utils/api/apiRequest";
import { errorToast } from "@/utils/errorToast";
import { urlBase64ToUint8Array } from "@/utils/urlBase64ToUint8Array";

export function AppSettingsPage() {
	return (
		<PageLayout>
			<PageLayout.Title>settings</PageLayout.Title>

			<div className="flex divide-y relative h-full flex-col overflow-auto p-4">
				<section className="flex flex-col border rounded-xl bg-card-item p-4 space-y-3">
					<h2 className="text-lg font-bold">notifications</h2>

					<div className="border-t"></div>

					<div className="flex items-center justify-between gap-2 text-sm font-medium">
						<NotificationSwitch />
					</div>

					<div className="border-t"></div>

					<div className="flex items-center justify-between gap-2 text-sm font-medium">
						<label htmlFor="notifications">task ending</label>
						<Switch id="notifications" />
					</div>
				</section>
			</div>

			<PageLayout.Footer className="flex gap-4 justify-between">
				<Button variant="destructive">delete account</Button>
				<Button>log out</Button>
			</PageLayout.Footer>
		</PageLayout>
	);
}

function NotificationSwitch() {
	const [enabled, setEnabled] = useState(localStorage.getItem("notifs-enabled") === "1");

	return (
		<>
			<label htmlFor="notifications">enabled on this device</label>
			<Switch
				id="notifications"
				checked={enabled}
				onCheckedChange={(value) => {
					if (value) {
						const toastId = toast.loading("enabling notifications...");

						return enableNotifications()
							.then(() => {
								setEnabled(true);
								toast.success("notifications enabled", { id: toastId });
							})
							.catch(errorToast("error enabling notifications", { id: toastId }));
					}

					const toastId = toast.loading("disabling notifications...");
					disableNotifications()
						.then(() => {
							setEnabled(false);
							toast.success("notifications disabled", { id: toastId });
						})
						.catch(errorToast("error disabling notifications", { id: toastId }));
				}}
			/>
		</>
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

async function disableNotifications() {
	const reg = await navigator.serviceWorker.getRegistration();
	if (!reg) {
		throw new Error("no service worker");
	}
	await navigator.serviceWorker.ready;

	const existingSub = await reg.pushManager.getSubscription();
	if (!existingSub) {
		localStorage.setItem("notifs-enabled", "0");
		return;
	}

	await existingSub.unsubscribe();
	await apiRequest<void>({
		method: "DELETE",
		path: "/notif-subs",
		body: { endpoint: existingSub.endpoint },
	});
}

async function createNotifSubscription(reg: ServiceWorkerRegistration) {
	const result = await window.Notification.requestPermission();

	if (result !== "granted") {
		return { error: "permission denied" };
	}

	const subscription = await reg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_APP_VAPID_PUB_KEY),
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
