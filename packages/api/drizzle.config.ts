import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
	schema: "./src/db/schema.ts",
	connectionString: process.env.DB_URL,
} satisfies Config;
