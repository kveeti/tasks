import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Nav() {
	const location = useLocation();

	return (
		<nav className="flex w-full max-w-max rounded-full border bg-card p-2 gap-1 text-sm">
			<NavLink to="/app" indicator={location.pathname === "/app" && <ActiveIndicator />}>
				home
			</NavLink>
			<NavLink
				to="/app/stats"
				indicator={location.pathname === "/app/stats" && <ActiveIndicator />}
			>
				stats
			</NavLink>
			<NavLink
				to="/app/tags"
				indicator={location.pathname === "/app/tags" && <ActiveIndicator />}
			>
				tags
			</NavLink>
			<MoreMenu />
		</nav>
	);
}

function ActiveIndicator() {
	return (
		<motion.div
			aria-hidden
			layoutId="active-indicator"
			className="absolute inset-0 w-full rounded-full bg-primary border border-gray-600"
			transition={{
				duration: 0.1,
				type: "spring",
				mass: 0.1,
			}}
		/>
	);
}

function NavLink({
	to,
	indicator,
	children,
}: {
	to: string;
	indicator?: ReactNode;
	children: ReactNode;
}) {
	return (
		<Link
			to={to}
			className="relative flex w-full items-center justify-center rounded-full py-2 px-4 outline-none outline-2 outline-offset-2 transition-[outline,opacity] duration-200 focus-visible:outline-gray-300"
		>
			{indicator}
			<span className="relative">{children}</span>
		</Link>
	);
}

function MoreMenu() {
	const location = useLocation();

	const showIndicator =
		location.pathname === "/app/settings" ||
		location.pathname === "/app/me" ||
		location.pathname === "/app/tasks";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="relative flex w-full items-center justify-center rounded-full py-2 px-4 outline-none outline-2 outline-offset-2 transition-[outline,opacity] duration-200 focus-visible:outline-gray-300">
					{showIndicator && <ActiveIndicator />}
					<span className="relative">more</span>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuItem asChild>
					<Link to="/app/settings">settings</Link>
				</DropdownMenuItem>

				{/* <DropdownMenuItem asChild>
					<Link to="/app/me">me</Link>
				</DropdownMenuItem> */}
				<DropdownMenuItem asChild>
					<Link to="/app/tasks">tasks</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
