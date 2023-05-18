import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";

import { AppNav } from "./AppNav";
import { TimerContext } from "./TimerContext";

export function AppLayout() {
	return (
		<TimerContext>
			<div className="flex h-full w-full items-center justify-center">
				<div className="relative flex h-[35rem] overflow-hidden rounded-2xl border-2 border-b-4 border-gray-800 shadow-xl">
					<div className="h-full w-[13rem]">
						<AppNav />
					</div>

					<div className="h-full w-[25rem] overflow-auto">
						<AnimatePresence>
							<Outlet />
						</AnimatePresence>
					</div>
				</div>
			</div>
		</TimerContext>
	);
}
