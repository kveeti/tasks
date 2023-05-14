import { Navigate, Outlet } from "react-router-dom";
import { AppNav } from "./AppNav";
import { TimerContext } from "./TimerContext";
import { useUserIdContext } from "./UserIdContext";

export function AppLayout() {
	const { userId } = useUserIdContext();

	if (!userId) {
		return <Navigate to="/auth/login" />;
	}

	return (
		<TimerContext>
			<div className="w-full h-full flex items-center justify-center">
				<div className="flex border-2 relative h-[35rem] border-b-4 shadow-xl border-gray-800 rounded-2xl">
					<div className="w-[13rem] h-full">
						<AppNav />
					</div>

					<div className="overflow-auto h-full w-[25rem]">
						<Outlet />
					</div>
				</div>
			</div>
		</TimerContext>
	);
}
