import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/utils/classNames";

type Props = {
	message?: ReactNode;
	htmlFor?: string;
	className?: string;
};

export const Error = ({ message, htmlFor, className }: Props) => {
	const hasError = !!message;

	return (
		<AnimatePresence>
			{hasError && (
				<motion.label
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto", transition: { duration: 0.15 } }}
					exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
					className={cn(
						className,
						"text-[15px] font-medium leading-[1] text-red-400 flex items-center gap-1 pt-2"
					)}
					htmlFor={htmlFor}
				>
					<XCircle strokeWidth={1} className="h-[1.2rem] w-[1.2rem]" /> {message}
				</motion.label>
			)}
		</AnimatePresence>
	);
};
