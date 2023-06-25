import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export const links = [
	{ id: "home", label: "home", href: "/app" },
	{ id: "stats", label: "stats", href: "/app/stats" },
	{ id: "tags", label: "tags", href: "/app/tags" },
	{ id: "tasks", label: "tasks", href: "/app/tasks" },
];

export function Nav() {
	const location = useLocation();
	const activeLinkId = links.find((link) => link.href === location.pathname)?.id;

	return (
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
	);
}
