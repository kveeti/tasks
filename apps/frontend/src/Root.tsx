import { Outlet } from "react-router-dom";

export function Root() {
	return (
		<div className="fixed w-full h-full">
			<Outlet />
		</div>
	);
}
