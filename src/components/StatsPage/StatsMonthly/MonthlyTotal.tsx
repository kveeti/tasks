import { useState } from "react";

import { Card } from "~ui/Card";
import { classNames } from "~utils/classNames";
import type { RouterOutputs } from "~utils/trpc";

type Props = {
	data?: RouterOutputs["me"]["stats"]["monthly"];
};

export const MonthlyTotal = ({ data }: Props) => {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<Card variant={2} className="mt-2 rounded-md">
			<div className="flex flex-col p-2" onClick={() => setIsOpen(!isOpen)}>
				<h2 className="text-lg font-bold">Total</h2>

				<div className="flex flex-col gap-1 pt-1">
					{data?.monthlyTotalMinutesPerTag.map((d, i) => (
						<div key={i} className="flex items-center gap-2">
							<div
								className={classNames("h-7 w-7 rounded-md")}
								style={{ backgroundColor: d.tag.color }}
							/>

							<div className="flex flex-col justify-between">
								<p>{d.tag.label}</p>
								<p>{d.minutes} min</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
};
