import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

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
								/>
							)}

							<span className="relative">{link.label}</span>
						</Link>
					))}
				</div>

				<div className="w-full border-2 border-gray-800 justify-between items-center rounded-xl p-1.5 flex gap-2">
					<span className="truncate">Coding</span>
					<span className="bg-gray-800 border border-gray-700 p-1 rounded-md">56:43</span>
				</div>
			</div>
		</div>
	);
}
