self.addEventListener("push", (e) => {
	const msgData = e.data.json();

	const title = msgData.payload.title;
	const message = msgData.payload.message;

	e.waitUntil(self.registration.showNotification(title, { body: message }));
});

self.addEventListener("install", (e) => {
	self.skipWaiting();
});
