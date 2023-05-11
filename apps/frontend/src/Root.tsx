import { Outlet, useNavigate } from "react-router-dom";

import { trpc } from "./api";

export function Root() {
	const navigate = useNavigate();
	const me = trpc.users.me.useQuery(undefined, { retry: false });

	if (!me.isLoading && me.error?.data?.code === "UNAUTHORIZED") {
		if (!window.location?.pathname.startsWith("/auth")) {
			navigate("/auth/login");
		}
	} else if (!me.isLoading && me.data) {
		if (!window.location?.pathname.startsWith("/app")) {
			navigate("/app");
		}
	}

	return (
		<>
			{!me.isLoading && (
				<div className="fixed w-full h-full">
					<Outlet />
				</div>
			)}
		</>
	);
}
