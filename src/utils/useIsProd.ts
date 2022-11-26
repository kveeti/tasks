import { env } from "~env/client.mjs";

export const useIsProd = () => {
	const isProd = env.NEXT_PUBLIC_ENV === "production";

	return isProd;
};
