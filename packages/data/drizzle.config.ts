import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
	schema: "./src/schema.ts",
	connectionString: process.env.DB_URL,
} satisfies Config;
