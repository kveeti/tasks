import type { ReactNode } from "react";

import { cn } from "@/utils/classNames";

export function Card(props: { children: ReactNode; className?: string }) {
	return (
		<div className={cn("flex h-full flex-col rounded-xl", props.className)}>
			{props.children}
		</div>
	);
}

function Header(props: { children: ReactNode }) {
	return (
		<h2 className="rounded-tl-xl rounded-tr-xl border-b-2 border-l-2 border-r-2 border-t-2 border-gray-800 bg-gray-900 px-3 py-2 font-bold">
			{props.children}
		</h2>
	);
}

function Body(props: { children: ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"rounded-bl-xl rounded-br-xl border-b-2 border-l-2 border-r-2 border-gray-800 p-2",
				props.className
			)}
		>
			{props.children}
		</div>
	);
}

Card.Header = Header;
Card.Body = Body;
