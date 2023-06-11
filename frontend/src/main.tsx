import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { Entrypoint } from "./Entrypoint";
import { ApiProvider } from "./api";
import { UserIdProvider } from "./auth";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<UserIdProvider>
			<ApiProvider>
				<Toaster richColors />

				<BrowserRouter>
					<Entrypoint />
				</BrowserRouter>
			</ApiProvider>
		</UserIdProvider>
	</React.StrictMode>
);
