import { Outlet } from "react-router-dom";

import { Nav } from "./nav";

export function AppLayout() {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
			<div className="h-full max-h-[550px] w-full max-w-[400px] overflow-hidden rounded-3xl border bg-card">
				<Outlet />
			</div>

			<Nav />
		</div>
	);
}
