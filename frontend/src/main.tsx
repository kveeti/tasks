import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { Entrypoint } from "./Entrypoint";
import { ApiProvider } from "./api";
import { UserCtxProvider } from "./auth";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<Suspense fallback={"suspending"}>
			<UserCtxProvider>
				<ApiProvider>
					<Toaster position="top-center" richColors theme="dark" />
					<BrowserRouter>
						<Entrypoint />
					</BrowserRouter>
				</ApiProvider>
			</UserCtxProvider>
		</Suspense>
	</React.StrictMode>
);
