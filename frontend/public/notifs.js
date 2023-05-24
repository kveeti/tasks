self.addEventListener("push", (e) => {
	const msgData = e.data.json();
	console.log("Push received", msgData);

	const title = msgData.payload.title;
	const message = msgData.payload.message;

	e.waitUntil(self.registration.showNotification(title, { body: message }));
});
