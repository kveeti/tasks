import { differenceInMilliseconds } from "date-fns";
import format from "date-fns/format";
import { AnimatePresence } from "framer-motion";

import { WithInitialAnimation } from "@/components/with-initial-animation";
import { type TaskWithTag, useTasks } from "@/utils/api/tasks";
import { humanizer } from "@/utils/humanizer";

import { WithAnimation } from "../WithAnimation";
import { AddTask } from "./AddTask";
import { TaskMenu } from "./TaskMenu";

export function AppTasksPage() {
	const tasks = useTasks();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 p-4 border-b">
					<h1 className="text-xl font-bold">tasks</h1>
				</div>

				<div className="flex h-full flex-col overflow-auto bg-black">
					{tasks.isLoading ? (
						<p className="p-8 text-center border-b">loading tasks...</p>
					) : tasks.isError ? (
						<p className="p-8 text-center border-b">failed to load tasks</p>
					) : !tasks.data?.length ? (
						<p className="p-8 text-center border-b">no tasks</p>
					) : (
						<ul className="divide-y border-b">
							<AnimatePresence initial={false}>
								{tasks.data.map((task) => (
									<Task key={task.id} task={task} />
								))}
							</AnimatePresence>
						</ul>
					)}
				</div>

				<div className="border-t p-4 ">
					<AddTask />
				</div>
			</div>
		</WithAnimation>
	);
}

function Task({ task }: { task: TaskWithTag }) {
	const started_at = new Date(task.started_at);
	const expires_at = new Date(task.stopped_at ?? task.expires_at);

	const humanDuration = humanizer(differenceInMilliseconds(expires_at, started_at), {
		language: "shortEn",
	});

	const times = format(started_at, "hh:mm") + " - " + format(expires_at, "hh:mm");

	return (
		<WithInitialAnimation key={task.id}>
			<div className="px-4 py-2 flex gap-4 items-center justify-between">
				<div className="flex gap-4 items-center">
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
				</div>

				<TaskMenu task={task} />
			</div>
		</WithInitialAnimation>
	);
}
