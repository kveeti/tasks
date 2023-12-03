self.addEventListener("install", function (event) {
	console.debug("sw - install", { event });
	self.skipWaiting();
});

self.addEventListener("activate", function (event) {
	console.debug("sw - activate", { event });
	event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
	console.debug("sw - push", { event });

	let eventData = event.data?.text();
	let json;

	try {
		json = JSON.parse(eventData);
	} catch (e) {
		console.error("sw - push - error parsing eventData", {
			error: e,
			textEventData: eventData,
		});
		return;
	}

	console.debug("sw - push - JSON", { json });

	const title = json?.title;
	const body = json?.message;

	if (!title || !body) {
		console.debug("sw - push - no title or message in parsed json", { json });
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
	console.debug("sw - notificationclick", { event });

	event.notification.close();

	const url = new URL("/", self.location.origin).toString();

	event.waitUntil(
		self.clients
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

				if (self.clients.openWindow) {
					return self.clients.openWindow(url);
				}
			})
	);
});
