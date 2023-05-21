import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "http";

import { apiRouter, createContext } from "@tasks/api";

import { env } from "./env";

const handler = createHTTPHandler({
	router: apiRouter,
	createContext,
});

const port = process.env.PORT || 8000;

createServer((req, res) => {
	res.setHeader("Access-Control-Allow-Origin", env.VITE_APP_URL);
	res.setHeader("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE,OPTIONS,HEAD");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, Content-Length, X-Requested-With"
	);
	res.setHeader("Access-Control-Allow-Credentials", "true");

	if (req.method === "OPTIONS") {
		res.writeHead(200);
		res.end();
		return;
	}

	handler(req, res);
}).listen(port, () => console.log(`Server started on port ${port}`));
