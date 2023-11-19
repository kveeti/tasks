import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;
declare let clients: Clients;

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

self.addEventListener("push", (event) => {
	console.debug("Push event received", { event });

	const eventData = event.data?.json();

	console.debug("Push event data", { eventData });

	const title = eventData?.title;
	const body = eventData?.message;

	if (!title || !body) {
		console.error("Invalid push event data:", { event, json: eventData });
		return;
	}

	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			icon: "/icons/app-icon-192x192.png",
		})
	);
});

self.addEventListener("notificationclick", (event) => {
	console.debug("Notification click event received", { event });

	event.notification.close();

	const url = new URL("/", self.location.origin).toString();

	event.waitUntil(
		clients
			.matchAll({
				type: "window",
				includeUncontrolled: true,
			})
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url.startsWith(url) && "focus" in client) {
						client.focus();
						return;
					}
				}

				if (clients.openWindow) {
					return clients.openWindow(url);
				}
			})
	);
});
