import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

import { useTimerContext } from "./TimerContext";

const links = [
	{ id: "home", label: "home", href: "/app" },
	{ id: "stats", label: "stats", href: "/app/stats" },
	{ id: "tags", label: "tags", href: "/app/tags" },
	{ id: "settings", label: "settings", href: "/app/settings" },
];

export function AppNav() {
	const location = useLocation();
	const activeLinkId = links.find((link) => link.href === location.pathname)?.id;

	return (
		<div className=" flex h-full flex-col border-r-2 border-r-gray-800 text-sm">
			<div className="border-b-2 border-b-gray-800 p-2">
				<div className="w-max rounded-xl p-2 py-1 hover:bg-gray-900">username</div>
			</div>

			<div className="flex h-full w-full flex-col gap-2 p-1.5">
				<div className="relative flex h-full w-full flex-col">
					{links.map((link) => (
						<Link
							key={link.id}
							to={link.href}
							className="relative w-full rounded-xl px-3 py-3 hover:bg-gray-900"
						>
							{activeLinkId === link.id && (
								<motion.div
									layoutId="active-indicator"
									className="absolute inset-0 w-full rounded-xl border-2 border-blue-900 bg-blue-900/40 hover:border-blue-900/80 hover:bg-blue-950/60"
									transition={{ duration: 0.35, type: "spring" }}
								/>
							)}

							<span className="relative">{link.label}</span>
						</Link>
					))}
				</div>

				<ActiveTasks />
			</div>
		</div>
	);
}

function ActiveTasks() {
	const { activeTasks } = useTimerContext();

	const taskPlural = activeTasks?.length === 1 ? "" : "s";

	const noTimes = !activeTasks || activeTasks.length === 0;

	return (
		<div className="flex flex-col">
			<h2 className="rounded-tl-xl rounded-tr-xl border-2 border-gray-800 bg-gray-900 p-2 font-bold">
				Active task{taskPlural}
			</h2>

			<div className="rounded-bl-xl rounded-br-xl border-b-2 border-l-2 border-r-2 border-gray-800 py-2">
				{noTimes ? (
					<span className="px-2">No active tasks</span>
				) : (
					activeTasks?.map((t) => (
						<div
							key={t.tag.id}
							className="flex w-full items-center justify-between gap-2 px-2"
						>
							<span>{t.tag.label}</span>
							<span className="tabular-nums">{`${t.timeUntilExpiry.minutes}:${t.timeUntilExpiry.seconds}`}</span>
						</div>
					))
				)}
			</div>
		</div>
	);
}
