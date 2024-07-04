import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";

import { Entrypoint } from "./entrypoint";
import { ApiProvider } from "./lib/api/provider";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ApiProvider>
			<Toaster position="top-center" richColors theme="dark" />

			<Entrypoint />
		</ApiProvider>
	</React.StrictMode>
);
