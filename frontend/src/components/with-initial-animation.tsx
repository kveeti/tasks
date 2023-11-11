import { type MotionProps, motion } from "framer-motion";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function WithInitialAnimation({
	className,
	...props
}: MotionProps & HTMLAttributes<HTMLDivElement>) {
	return (
		<motion.div
			initial={{
				backgroundColor: "rgba(50, 50, 50, 1)",
			}}
			animate={{
				backgroundColor: "rgba(0, 0, 0, 0)",
			}}
			transition={{ duration: 1.2 }}
			className={cn(className, "flex")}
			{...props}
		>
			{props.children}
		</motion.div>
	);
}
