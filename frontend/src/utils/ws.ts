import { useEffect } from "react";
import useWebSocket from "react-use-websocket";

import { db } from "@/db/db";

const wsUrl = import.meta.env.VITE_APP_API_WS_URL;

export function useWs() {
	const ws = useWebSocket<{ t: string; d: any }>(wsUrl, {
		share: true,
		shouldReconnect: () => true,
	});

	useEffect(() => {
		if (ws.lastJsonMessage) {
			console.log(ws.lastJsonMessage);

			if (ws.lastJsonMessage.t === "sync") {
				const tasks = ws.lastJsonMessage?.d?.tasks;
				const tags = ws.lastJsonMessage?.d?.tags;

				tags?.length && db.tags.bulkPut(tags);
				tasks?.length && db.tasks.bulkPut(tasks);
			}
		}
	}, [ws.lastJsonMessage]);

	useEffect(() => {
		if (ws.readyState === WebSocket.OPEN) {
			console.log("ws open");
		} else if (ws.readyState === WebSocket.CLOSED) {
			console.log("ws close");
		}
	}, [ws.readyState]);
}
