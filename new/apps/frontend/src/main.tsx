import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { ApiProvider } from "./api";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ApiProvider>
			<App />
		</ApiProvider>
	</React.StrictMode>
);
