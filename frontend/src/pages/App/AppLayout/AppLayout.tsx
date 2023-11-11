import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";

import { Nav } from "./Nav";

export function AppLayout() {
	return (
		<div className="fixed h-full w-full">
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
				<div className="h-full max-h-[550px] w-full max-w-[400px] overflow-hidden rounded-3xl border bg-card">
					<AnimatePresence initial={false}>
						<Outlet />
					</AnimatePresence>
				</div>

				<Nav />
			</div>
		</div>
	);
}
