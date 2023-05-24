import { Navigate, Outlet } from "react-router-dom";
import { useUserId } from "../../auth";

export function AuthLayout() {
	const userId = useUserId();

	if (userId) {
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
