import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { CallbackPage } from "./Auth/CallbackPage";
import { LoginPage } from "./Auth/LoginPage";
import { Root } from "./Root";
import { ApiProvider } from "./api";
import "./main.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
	},
	{
		path: "/auth/login",
		element: <LoginPage />,
	},
	{
		path: "/auth/callback",
		element: <CallbackPage />,
	},
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ApiProvider>
			<RouterProvider router={router} />
		</ApiProvider>
	</React.StrictMode>
);
