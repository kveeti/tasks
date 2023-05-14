import { Navigate, Outlet } from "react-router-dom";
import { useUserIdContext } from "../App/UserIdContext";

export function AuthLayout() {
	const { userId } = useUserIdContext();

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
