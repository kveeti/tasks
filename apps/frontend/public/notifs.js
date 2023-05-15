self.addEventListener("push", (e) => {
	const msgData = e.data.json();

	console.log(msgData);

	if (msgData.type === "START_TIMER") {
		const sendAfter = msgData.payload.sendAfter;
		const tagName = msgData.payload.tagName;
		const minutes = msgData.payload.minutes;
		const seconds = msgData.payload.seconds;

		e.waitUntil(
			new Promise((res) => {
				setTimeout(() => {
					res(
						showNotif(
							"Timer expired",
							`Timer for ${tagName} expired after ${minutes}:${seconds}`
						)
					);
				}, sendAfter);
			})
		);
	} else if (msgData.type === "NOTIFICATION") {
		const title = msgData.payload.title;
		const message = msgData.payload.message;

		e.waitUntil(
			new Promise((res) => {
				res(self.registration.showNotification(title, { body: message }));
			})
		);
	}
});

self.addEventListener("message", (e) => {
	const msgData = JSON.parse(e.data);
	console.log(msgData);

	if (msgData.type === "START_TIMER") {
		const sendAfter = msgData.payload.sendAfter;
		const title = msgData.payload.title;
		const message = msgData.payload.message;

		e.waitUntil(
			new Promise((res) => {
				setTimeout(() => {
					res(self.registration.showNotification(title, { body: message }));
				}, sendAfter);
			})
		);
	}
});

self.addEventListener("install", (e) => {
	self.skipWaiting();
});
