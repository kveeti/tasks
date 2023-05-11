import { Outlet } from "react-router-dom";

export function AuthLayout() {
	return (
		<div className="flex h-full flex-col justify-center">
			<main className="flex flex-col items-center">
				<Outlet />
			</main>
		</div>
	);
}
