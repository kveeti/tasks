import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { AnimatedChevron } from "~ui/AnimatedChevron";
import { Card } from "~ui/Card";
import { classNames } from "~utils/classNames";
import type { RouterOutputs } from "~utils/trpc";

import type { WeekdayInfoDay } from "./WeekdayInfo";

type Props = {
	data?: RouterOutputs["me"]["stats"]["daily"];
	setSelectedDay: (day: WeekdayInfoDay) => void;
};

export const WeeklyTotal = ({ data }: Props) => {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<Card variant={2} className="mt-2 rounded-md">
			<div className="flex flex-col p-2" onClick={() => setIsOpen(!isOpen)}>
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-bold">Total</h2>

					<Card variant={3} className="rounded-md">
						<div className="p-1">
							<AnimatedChevron openByDefault open={isOpen} />
						</div>
					</Card>
				</div>

				<AnimatePresence initial={false}>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							{data?.weeklyTotalMinutesPerTag.map((d, i) => (
								<div key={i} className="flex items-center gap-2 pt-2">
									<div
										className={classNames("h-8 w-8 rounded-md")}
										style={{ backgroundColor: d.tag.color }}
									/>

									<div className="flex flex-col justify-between">
										<p>{d.tag.label}</p>
										<p>{d.minutes} min</p>
									</div>
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</Card>
	);
};
