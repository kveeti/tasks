import { motion } from "framer-motion";

import { ChevronDown } from "./Icons/ChevronDown";

type Props = {
	open: boolean;
	className?: string;
};

export const AnimatedChevron = ({ open, className }: Props) => (
	<motion.div
		key="chevron"
		aria-hidden="true"
		initial={{ transform: "rotate(0deg)" }}
		animate={open ? { transform: "rotate(180deg)" } : { transform: "rotate(0deg)" }}
		transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
	>
		<ChevronDown />
	</motion.div>
);
