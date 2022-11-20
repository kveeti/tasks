import { PrismaClient } from "@prisma/client";

import { env } from "../../env/server.mjs";

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined;
}

export const prisma =
	global.prisma ||
	new PrismaClient({
		log: env.VERCEL_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

if (env.VERCEL_ENV !== "production") {
	global.prisma = prisma;
}
