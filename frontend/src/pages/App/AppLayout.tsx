import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { LinkButton } from "@/Ui/NewLink";
import { useUser, useUserContext } from "@/auth";
import { sleep } from "@/utils/sleep";
import { useHotkeys } from "@/utils/useHotkeys";

const links = [
	{ id: "home", label: "home", href: "/app" },
	{ id: "stats", label: "stats", href: "/app/stats" },
	{ id: "tags", label: "tags", href: "/app/tags" },
	{ id: "tasks", label: "tasks", href: "/app/tasks" },
];

export function AppLayout() {
	useKeybinds();

	const location = useLocation();
	const activeLinkId = links.find((link) => link.href === location.pathname)?.id;

	return (
		<div className="fixed h-full w-full">
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
				<div className="flex w-full justify-between max-w-[400px] rounded-full border border-gray-800 bg-gray-900 items-center p-2">
					<h1 className="font-bold px-2">tasks</h1>

					<UserMenu />
				</div>

				<div className="h-full max-h-[500px] w-full max-w-[400px] overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
					<AnimatePresence initial={false}>
						<Outlet />
					</AnimatePresence>
				</div>

				<div className="flex w-full max-w-[320px] rounded-full border border-gray-800 bg-gray-900 p-2">
					{links.map((l) => (
						<Link
							key={l.id}
							to={l.href}
							className="relative flex w-full items-center justify-center rounded-full px-4 py-2 outline-none outline-2 outline-offset-2 transition-[outline,opacity] duration-200 focus-visible:outline-gray-300"
						>
							{activeLinkId === l.id && (
								<motion.div
									layoutId="active-indicator"
									className="absolute inset-0 w-full rounded-full border border-gray-50/10 bg-gray-50/20"
									transition={{
										duration: 0.1,
										type: "spring",
										mass: 0.1,
									}}
								/>
							)}
							<span className="relative">{l.label}</span>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

function UserMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const { logout } = useUserContext();

	return (
		<>
			<Button
				className="rounded-full bg-gray-600 h-10 w-10 flex items-center justify-center"
				onPress={() => setIsOpen(true)}
			>
				T
			</Button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold">actions</h1>

					<div className="flex flex-col gap-2">
						<LinkButton
							to="/app/settings"
							onPress={() => setIsOpen(false)}
							className="w-full p-3"
						>
							settings
						</LinkButton>

						<Button className="w-full p-3" onPress={() => logout()}>
							logout
						</Button>
					</div>
				</div>
			</Modal>
		</>
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
