// @ts-check
import { z } from "zod";

export const serverSchema = z.object({
	DATABASE_URL: z.string(),
	ENV: z.enum(["development", "preview", "production"]),
	PREVIEW_PASSWORD: process.env.ENV === "preview" ? z.string() : z.string().optional(),
	NEXTAUTH_SECRET:
		process.env.ENV === "production" ? z.string().min(1) : z.string().min(1).optional(),
	NEXTAUTH_URL: z.preprocess(
		(str) => process.env.VERCEL_URL ?? str,
		process.env.VERCEL ? z.string() : z.string().url()
	),
	G_CLIENT_ID: process.env.ENV === "production" ? z.string() : z.string().optional(),
	G_CLIENT_SECRET: process.env.ENV === "production" ? z.string() : z.string().optional(),
});

export const clientSchema = z.object({
	NEXT_PUBLIC_ENV: z.string(),
});

/**
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
	NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
};
