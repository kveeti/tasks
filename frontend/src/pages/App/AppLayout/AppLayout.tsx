import { AnimatePresence } from "framer-motion";
import { Outlet, useNavigate } from "react-router-dom";

import { useHotkeys } from "@/utils/useHotkeys";

import { Nav, links } from "./Nav";
import { NetworkStatus } from "./NetworkStatus";
import { UserMenu } from "./UserMenu";

export function AppLayout() {
	useKeybinds();

	return (
		<div className="fixed h-full w-full">
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
				<div className="flex w-full justify-between max-w-[400px] rounded-full border border-gray-800 bg-gray-900 items-center p-2">
					<div className="flex gap-1 items-center">
						<h1 className="font-bold px-2">tasks</h1>

						<NetworkStatus />
					</div>

					<UserMenu />
				</div>

				<div className="h-full max-h-[500px] w-full max-w-[400px] overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
					<AnimatePresence initial={false}>
						<Outlet />
					</AnimatePresence>
				</div>

				<Nav />
			</div>
		</div>
	);
}

function useKeybinds() {
	const navigate = useNavigate();

	useHotkeys([
		["mod+1", () => navigate(links[0]!.href)],
		["mod+2", () => navigate(links[1]!.href)],
		["mod+3", () => navigate(links[2]!.href)],
		["mod+4", () => navigate(links[3]!.href)],
		["mod+shift+,", () => navigate("/app/settings")],
	]);
}
