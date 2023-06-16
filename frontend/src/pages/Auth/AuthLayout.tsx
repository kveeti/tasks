import { Navigate, Outlet } from "react-router-dom";

import { useUser } from "@/auth";

export function AuthLayout() {
	const user = useUser();

	if (user) {
		return <Navigate to="/app" />;
	}

	return (
		<div className="flex h-full flex-col justify-center">
			<main className="flex flex-col items-center">
				<Outlet />
			</main>
		</div>
	);
}
