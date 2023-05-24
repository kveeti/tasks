import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export function WithAnimation(props: { children: ReactNode }) {
	const location = useLocation();

	return (
		<motion.div
			key={location.pathname}
			className="h-full w-full"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			{props.children}
		</motion.div>
	);
}
