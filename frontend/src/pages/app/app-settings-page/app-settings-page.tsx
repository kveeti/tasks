import { toast } from "sonner";

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/utils/api/apiRequest";
import { errorToast } from "@/utils/errorToast";
import { useLocalStorage } from "@/utils/hooks/use-local-storage";
import { notificationsEnabledLocalStorageKey } from "@/utils/hooks/use-notifications";
import { urlBase64ToUint8Array } from "@/utils/urlBase64ToUint8Array";

import { Logout } from "./logout";

export function AppSettingsPage() {
	return (
		<PageLayout>
			<PageLayout.Title>settings</PageLayout.Title>

			<main className="flex divide-y relative h-full flex-col overflow-auto p-4">
				<section className="flex flex-col border rounded-xl bg-card-item p-4 space-y-3">
					<h2 className="text-lg font-bold">notifications</h2>

					<div className="border-t"></div>

					<div className="flex items-center justify-between gap-2 text-sm font-medium">
						<NotificationSwitch />
					</div>

					{/* <div className="border-t"></div>

					<div className="flex items-center justify-between gap-2 text-sm font-medium">
						<label htmlFor="notifications">task ending</label>
						<Switch id="notifications" />
					</div> */}
				</section>
			</main>

			<PageLayout.Footer className="flex gap-4 justify-between">
				<Button variant="destructive">delete account</Button>
				<Logout />
			</PageLayout.Footer>
		</PageLayout>
	);
}

function NotificationSwitch() {
	const [notificationEnabled, setNotificationsEnabled] = useLocalStorage(
		notificationsEnabledLocalStorageKey,
		"0"
	);
	const isNotificationsEnabled = notificationEnabled === "1";

	return (
		<>
			<label htmlFor="notifications">enabled on this device</label>
			<Switch
				id="notifications"
				checked={isNotificationsEnabled}
				onCheckedChange={(value) => {
					if (value) {
						const toastId = toast.loading("enabling notifications...");

						return enableNotifications()
							.then(() => {
								setNotificationsEnabled("1");
								toast.success("notifications enabled", { id: toastId });
							})
							.catch(errorToast("error enabling notifications", { id: toastId }));
					}

					const toastId = toast.loading("disabling notifications...");
					disableNotifications()
						.then(() => {
							setNotificationsEnabled("0");
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
	const result = await window.Notification.requestPermission().catch(() => "denied");
	if (result !== "granted") {
		return { error: "permission denied" };
	}

	const subscription = await reg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_APP_VAPID_PUBLIC_KEY),
	});

	const subJson = subscription?.toJSON();
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
