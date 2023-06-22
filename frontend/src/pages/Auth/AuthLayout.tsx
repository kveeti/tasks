import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useUser } from "@/auth";
import { db } from "@/db/db";

export function AuthLayout() {
	const user = useUser();

	useEffect(() => {
		db.open();
	}, []);

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
