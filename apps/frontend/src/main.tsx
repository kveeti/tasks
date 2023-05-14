import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { ApiProvider } from "./api";
import "./main.css";
import { Entrypoint } from "./Entrypoint";
import { UserIdProvider } from "./auth";

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
