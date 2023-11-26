import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { Entrypoint } from "./Entrypoint";
import { ApiProvider } from "./api";
import { FullscreenLoading } from "./components/fullscreen-loading";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<Suspense fallback={<FullscreenLoading />}>
			<ApiProvider>
				<Toaster position="top-center" richColors theme="dark" />

				{!import.meta.env.PROD && (
					<div className="fixed top-0 bottom-0 left-0 right-0 text-center p-2 border-4 border-red-500" />
				)}

				<BrowserRouter>
					<Entrypoint />
				</BrowserRouter>
			</ApiProvider>
		</Suspense>
	</React.StrictMode>
);
