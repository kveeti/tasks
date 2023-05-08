import { useNavigate } from "react-router-dom";

import { trpc } from "./api";

export function Root() {
	const navigate = useNavigate();
	const me = trpc.users.me.useQuery(undefined, { retry: false });

	if (!me.isLoading && me.error?.data?.code === "UNAUTHORIZED") {
		navigate("/auth/login");
	} else if (!me.isLoading && me.data) {
		navigate("/app");
	}

	return null;
}
