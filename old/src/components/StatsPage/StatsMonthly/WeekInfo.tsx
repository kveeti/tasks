import format from "date-fns/format";
import { motion } from "framer-motion";

import { Button } from "~ui/Button";
import { Card } from "~ui/Card";
import { CloseIcon } from "~ui/Icons/CloseIcon";
import type { RouterOutputs } from "~utils/trpc";

export type WeekData = RouterOutputs["me"]["stats"]["monthly"]["monthlyStats"][number];

type Props = {
	selectedInnerWeek: WeekData;
	setSelectedInnerWeek: (date: WeekData | null) => void;
};

export const WeekInfo = ({ selectedInnerWeek, setSelectedInnerWeek }: Props) => {
	return (
		<motion.div
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: "auto", opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
			key="weekday-info"
		>
			<div className="pt-2" />

			<Card variant={2} className="rounded-md">
				<div className="flex select-none flex-col p-2">
					<div className="flex justify-between gap-2">
						<h2 className="text-lg font-bold">
							Week {format(selectedInnerWeek.week, "I")}
						</h2>

						<Button size="small" onClick={() => setSelectedInnerWeek(null)}>
							<CloseIcon />
						</Button>
					</div>

					<div>
						<div className="flex flex-col gap-2 pt-2">
							<p>Total: {selectedInnerWeek.totalMinutes} min</p>

							{selectedInnerWeek.tagMinutes.map((tm) => (
								<div key={tm.tag.id} className="flex items-center gap-2">
									<div
										className="h-7 w-7 rounded-md"
										style={{ backgroundColor: tm.tag.color }}
									/>

									<div className="flex flex-col">
										<p>{tm.tag.label}</p>
										<p>{tm.minutes} min</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</Card>
		</motion.div>
	);
};
