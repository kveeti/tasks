import { env } from "~env/server.mjs";

/**
 * Returns true if the current environment is production (FOR SERVER)
 */
export const isProd = env.ENV === "production";
