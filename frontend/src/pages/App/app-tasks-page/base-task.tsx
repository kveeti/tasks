import { differenceInMilliseconds, format } from "date-fns";

import type { ApiTaskWithTag } from "@/utils/api/tasks";
import { humanizer } from "@/utils/humanizer";

export function BaseTask({ task }: { task: ApiTaskWithTag }) {
	const started_at = new Date(task.started_at);
	const expires_at = new Date(task.stopped_at ?? task.expires_at);

	const humanDuration = humanizer(differenceInMilliseconds(expires_at, started_at), {
		language: "shortEn",
	});

	const times = format(started_at, "hh:mm") + " - " + format(expires_at, "hh:mm");

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
					{humanDuration} - ({times}) - {format(started_at, "yyyy-MM-dd")}
				</p>
			</div>
		</>
	);
}
