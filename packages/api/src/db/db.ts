import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

if (!process.env.DB_URL) throw new Error("DB_URL is not defined");

const poolConnection = mysql.createPool(process.env.DB_URL);

export const db = drizzle(poolConnection);
