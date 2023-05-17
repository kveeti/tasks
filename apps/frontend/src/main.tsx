import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Entrypoint } from "./Entrypoint";
import { ApiProvider } from "./api";
import { UserIdProvider } from "./auth";
import "./main.css";
import "./toasts.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<UserIdProvider>
			<ApiProvider>
				<BrowserRouter>
					<Entrypoint />
				</BrowserRouter>
			</ApiProvider>
		</UserIdProvider>
	</React.StrictMode>
);
