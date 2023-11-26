import { motion } from "framer-motion";
import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from "react";

import { cn } from "@/lib/utils";

export function PageLayout({ children }: { children: ReactNode }) {
	return (
		<motion.div
			key={location.pathname}
			className="h-full w-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			{children}
		</motion.div>
	);
}

const Title = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<"h1">>(
	({ className, ...props }, ref) => {
		return (
			<h1
				ref={ref}
				{...props}
				className={cn("text-xl font-bold border-b p-4 shadow-lg z-10", className)}
			/>
		);
	}
);
Title.displayName = "Title";

const Footer = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
	({ className, ...props }, ref) => {
		return <div ref={ref} className={cn("border-t p-4", className)} {...props} />;
	}
);
Footer.displayName = "Footer";

PageLayout.Title = Title;
PageLayout.Footer = Footer;
