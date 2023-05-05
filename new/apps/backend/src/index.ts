import { apiRouter, createContext } from "@tasks/api";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "http";

const handler = createHTTPHandler({
	router: apiRouter,
	createContext,
});

createServer((req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
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
}).listen(5000, () => console.log("Server started on port 5000"));
