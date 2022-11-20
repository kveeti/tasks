// @ts-check
import { z } from "zod";

export const serverSchema = z.object({
	DATABASE_URL: z.string(),
	VERCEL_ENV: z.enum(["development", "preview", "production"]),
	NEXTAUTH_SECRET:
		process.env.VERCEL_ENV === "production" ? z.string().min(1) : z.string().min(1).optional(),
	NEXTAUTH_URL: z.preprocess(
		(str) => process.env.VERCEL_URL ?? str,
		process.env.VERCEL ? z.string() : z.string().url()
	),
	G_CLIENT_ID: process.env.VERCEL_ENV === "production" ? z.string() : z.string().optional(),
	G_CLIENT_SECRET: process.env.VERCEL_ENV === "production" ? z.string() : z.string().optional(),
});
