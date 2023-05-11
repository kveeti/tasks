import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { CallbackPage } from "./Auth/CallbackPage";
import { LoginPage } from "./Auth/LoginPage";
import { ApiProvider } from "./api";
import "./main.css";
import { AppPage } from "./App/AppPage";
import { Root } from "./Root";
import { AppLayout } from "./App/AppLayout";
import { StatsPage } from "./App/StatsPage";
import { AuthLayout } from "./Auth/AuthLayout";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ApiProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Root />}>
						<Route path="auth" element={<AuthLayout />}>
							<Route path="login" element={<LoginPage />} />
							<Route path="callback" element={<CallbackPage />} />
						</Route>

						<Route path="app" element={<AppLayout />}>
							<Route index element={<AppPage />} />
							<Route path="stats" element={<StatsPage />} />
						</Route>
					</Route>
				</Routes>
			</BrowserRouter>
		</ApiProvider>
	</React.StrictMode>
);
