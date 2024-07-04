import { format } from "date-fns";

import type { ApiTaskWithTag } from "@/lib/api/tasks";
import { formatDate, formatTime, humanizer } from "@/lib/time";

export function BaseTask({ task }: { task: ApiTaskWithTag }) {
	const start = new Date(task.start_at);
	const end = new Date(task.end_at);

	const humanDuration = humanizer(Math.floor(task.seconds * 1000), {
		language: "en",
	});

	return (
		<>
			<div
				aria-hidden
				className={`w-3.5 h-3.5 rounded-full`}
				style={{ backgroundColor: task.tag_color }}
			/>

			<div>
				<p>{task.tag_label}</p>
				<time
					className="text-gray-300 text-sm"
					dateTime={format(start, "yyyy-MM-dd'T'HH:mm")}
				>
					{formatDate(start)}
				</time>
				<p className="text-gray-300 text-sm">
					<span>{formatTime(start)}</span>
					<span> - </span>
					<span>{formatTime(end)}</span>
					<span> </span>
					<span>({humanDuration})</span>
				</p>
			</div>
		</>
	);
}
