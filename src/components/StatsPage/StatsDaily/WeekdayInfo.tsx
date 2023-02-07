import format from "date-fns/format";
import { motion } from "framer-motion";

import { Button } from "~ui/Button";
import { Card } from "~ui/Card";
import { CloseIcon } from "~ui/Icons/CloseIcon";
import type { RouterOutputs } from "~utils/trpc";

export type WeekdayInfoDay = RouterOutputs["me"]["stats"]["weekly"]["dailyStats"][number];

type Props = {
	data: WeekdayInfoDay;
	setSelectedDay: (date: WeekdayInfoDay | null) => void;
};

export const WeekdayInfo = ({ data, setSelectedDay }: Props) => {
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
						<h2 className="text-lg font-bold">{format(data.date, "EEEEEEE")}</h2>

						<Button size="small" onClick={() => setSelectedDay(null)}>
							<CloseIcon />
						</Button>
					</div>

					<div>
						<div className="flex flex-col gap-2 pt-2">
							<p>Total: {data.totalMinutes} min</p>

							{data.tagMinutes.map((tm) => (
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
