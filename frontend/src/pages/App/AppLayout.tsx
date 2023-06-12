import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";

import { useSyncing } from "@/utils/Syncing";
import { useIsMobile } from "@/utils/useMediaQuery";

import { AppNav, MobileAppNav } from "./AppNav";
import { TimerContext } from "./TimerContext";

export function AppLayout() {
	useSyncing();
	const isMobile = useIsMobile();

	return isMobile ? <MobileAppLayout /> : <DesktopAppLayout />;
}

function DesktopAppLayout() {
	return (
		<TimerContext>
			<div className="flex h-full w-full items-center justify-center">
				<div className="flex h-[38rem] overflow-hidden rounded-2xl border-2 border-b-4 border-gray-800 shadow-xl">
					<div className="h-full w-[13rem]">
						<AppNav />
					</div>

					<div className="h-full w-[30rem] overflow-auto">
						<AnimatePresence>
							<Outlet />
						</AnimatePresence>
					</div>
				</div>
			</div>
		</TimerContext>
	);
}

function MobileAppLayout() {
	return (
		<TimerContext>
			<div className="flex w-full justify-center">
				<div className="flex w-full max-w-[22rem]">
					<AnimatePresence>
						<Outlet />
					</AnimatePresence>
				</div>
			</div>

			<MobileAppNav />
		</TimerContext>
	);
}
