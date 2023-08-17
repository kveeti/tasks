import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { Entrypoint } from "./Entrypoint";
import { ApiProvider } from "./api";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ApiProvider>
			<Toaster richColors position="top-center" theme="dark" />

			<BrowserRouter>
				<Entrypoint />
			</BrowserRouter>
		</ApiProvider>
	</React.StrictMode>
);
