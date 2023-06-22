import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { Entrypoint } from "./Entrypoint";
import { ApiProvider } from "./api";
import { UserCtxProvider } from "./auth";
import "./main.css";
import { SyncingContextProvider } from "./utils/Syncing";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<UserCtxProvider>
			<ApiProvider>
				<SyncingContextProvider>
					<Toaster richColors position="top-center" theme="dark" />

					<BrowserRouter>
						<Entrypoint />
					</BrowserRouter>
				</SyncingContextProvider>
			</ApiProvider>
		</UserCtxProvider>
	</React.StrictMode>
);
