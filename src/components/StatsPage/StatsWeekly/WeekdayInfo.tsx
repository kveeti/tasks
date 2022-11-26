import format from "date-fns/format";
import { motion } from "framer-motion";
import { useRef } from "react";

import { Card } from "~ui/Card";
import type { RouterOutputs } from "~utils/trpc";

export type WeekdayInfoDay = RouterOutputs["me"]["stats"]["daily"]["dailyStats"][number];

type Props = {
	data: WeekdayInfoDay | null;
};

export const WeekdayInfo = ({ data }: Props) => {
	const ref = useRef<HTMLDivElement>(null);

	if (!data) return null;

	return (
		<motion.div
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: "auto", opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
		>
			<div className="pt-2" />

			<Card variant={2} className="rounded-md">
				<div className="flex select-none flex-col p-2" ref={ref}>
					<h2 className="text-lg font-bold">{format(data.date, "EEEEEEE")}</h2>

					<div>
						<div className="flex flex-col gap-2 pt-2">
							<p>Total: {data.totalMinutes} min</p>

							{data.tagMinutes.map((tm) => (
								<div key={tm.tag.id} className="flex items-center gap-2">
									<div
										className="h-8 w-8 rounded-md"
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
