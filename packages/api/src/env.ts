import { z } from "zod";

const envSchema = z.object({
	JWT_SECRET: z.string(),
	// JWT_ISSUER: z.string(),
	// JWT_AUDIENCE: z.string(),

	DB_URL: z.string(),

	VAPID_PUBLIC_KEY: z.string(),
	VAPID_PRIVATE_KEY: z.string(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
	...parsedEnv,
	JWT_SECRET: new TextEncoder().encode(parsedEnv.JWT_SECRET),
};
