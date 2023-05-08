import { z } from "zod";

const envSchema = z.object({
	VITE_APP_URL: z.string(),
});

export const env = envSchema.parse(process.env);
