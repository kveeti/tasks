import { differenceInMilliseconds, format } from "date-fns";

import type { ApiTaskWithTag } from "@/utils/api/tasks";
import { humanizer } from "@/utils/humanizer";

export function BaseTask({ task }: { task: ApiTaskWithTag }) {
	const start = new Date(task.start_at);
	const end = new Date(task.end_at);

	const humanDuration = humanizer(differenceInMilliseconds(end, start), {
		language: "shortEn",
	});

	const times = format(start, "hh:mm") + " - " + format(end, "hh:mm");

	return (
		<>
			<div
				aria-hidden
				className={`w-3.5 h-3.5 rounded-full`}
				style={{ backgroundColor: task.tag_color }}
			/>

			<div>
				<p>{task.tag_label}</p>
				<p className="text-gray-300 text-sm">
					{humanDuration} - ({times})
				</p>
			</div>
		</>
	);
}
