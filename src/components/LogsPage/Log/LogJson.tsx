import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { AnimatedChevron } from "~ui/AnimatedChevron";
import { Card } from "~ui/Card";
import type { RouterOutputs } from "~utils/trpc";

export const LogJson = ({ log }: { log: RouterOutputs["admin"]["getLogs"]["logs"][number] }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Card variant={2} className="mt-2 rounded-md">
			<div className="flex flex-col p-2" onClick={() => setIsOpen(!isOpen)}>
				<div className="flex items-center justify-between">
					<p>JSON</p>

					<Card variant={3} className="rounded-md">
						<div className="p-1">
							<AnimatedChevron open={isOpen} />
						</div>
					</Card>
				</div>

				<AnimatePresence initial={false}>
					{isOpen && (
						<motion.pre
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							{JSON.stringify(log, null, 2)}
						</motion.pre>
					)}
				</AnimatePresence>
			</div>
		</Card>
	);
};
