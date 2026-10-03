const apiUrl = document.querySelector<HTMLMetaElement>(
	'meta[name="tasks-api-url"]',
)?.content;
const vapidPublicKey = document.querySelector<HTMLMetaElement>(
	'meta[name="tasks-vapid-public-key"]',
)?.content;

export const conf = {
	API_URL:
		(apiUrl && !apiUrl.startsWith("$")
			? apiUrl
			: process.env.PUBLIC_API_URL) + "/api/v1",
	VAPID_PUBLIC_KEY:
		vapidPublicKey && !vapidPublicKey.startsWith("$")
			? vapidPublicKey
			: process.env.PUBLIC_VAPID_PUBLIC_KEY!,

	IS_PROD: process.env.NODE_ENV === "production",
};
