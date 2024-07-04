export const conf = {
	API_URL: process.env.PUBLIC_API_URL + "/api/v1",
	VAPID_PUBLIC_KEY: process.env.PUBLIC_VAPID_PUBLIC_KEY!,
	IS_PROD: process.env.NODE_ENV === "production",
};
