import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useTimerContext } from "./TimerContext";

const links = [
	{ id: "home", label: "home", href: "/app" },
	{ id: "stats", label: "stats", href: "/app/stats" },
	{ id: "tags", label: "tags", href: "/app/tags" },
];

export function AppNav() {
	const location = useLocation();
	const activeLinkId = links.find((link) => link.href === location.pathname)?.id;

	return (
		<div className=" border-r-2 border-r-gray-800 flex flex-col h-full text-sm">
			<div className="border-b-2 border-b-gray-800 p-2">
				<div className="hover:bg-gray-900 p-2 py-1 rounded-xl w-max">username</div>
			</div>

			<div className="p-1.5 flex flex-col gap-2 h-full w-full">
				<div className="flex flex-col w-full h-full relative">
					{links.map((link) => (
						<Link
							key={link.id}
							to={link.href}
							className="relative hover:bg-gray-900 w-full rounded-xl px-3 py-3"
						>
							{activeLinkId === link.id && (
								<motion.div
									layoutId="active-indicator"
									className="absolute inset-0 hover:bg-blue-950/60 hover:border-blue-900/80 w-full rounded-xl bg-blue-900/40 border-2 border-blue-900"
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
			<h2 className="p-2 border-2 font-bold border-gray-800 bg-gray-900 rounded-tr-xl rounded-tl-xl">
				Active task{taskPlural}
			</h2>

			<div className="py-2 border-b-2 border-l-2 border-r-2 border-gray-800 rounded-br-xl rounded-bl-xl">
				{noTimes ? (
					<span className="px-2">No active tasks</span>
				) : (
					activeTasks?.map((t) => (
						<div
							key={t.tag.id}
							className="w-full justify-between items-center flex gap-2 px-2"
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
