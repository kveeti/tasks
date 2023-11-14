import { AnimatePresence, motion } from "framer-motion";

import { WithEnterExitAnimation } from "@/components/with-initial-animation";
import { type ApiTaskWithTag, useTasks } from "@/utils/api/tasks";

import { WithAnimation } from "../WithAnimation";
import { AddTask } from "./add-task";
import { BaseTask } from "./base-task";
import { TaskMenu } from "./task-menu";

export function AppTasksPage() {
	const tasks = useTasks();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 p-4 border-b">
					<h1 className="text-xl font-bold">tasks</h1>
				</div>

				<div className="flex h-full relative flex-col overflow-auto bg-black">
					{tasks.isLoading ? (
						<p className="p-8 text-center border-b">loading tasks...</p>
					) : tasks.isError ? (
						<p className="p-8 text-center border-b">error loading tasks</p>
					) : (
						<AnimatePresence initial={false} mode="popLayout">
							<ul key="tasks" className="border-b divide-y">
								<AnimatePresence initial={false}>
									{tasks.data?.map((task) => (
										<li key={task.id}>
											<WithEnterExitAnimation>
												<Task task={task} />
											</WithEnterExitAnimation>
										</li>
									))}
								</AnimatePresence>
							</ul>

							{!tasks.data?.length && (
								<motion.p
									key="no-tasks"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, transition: { delay: 0.5 } }}
									exit={{ opacity: 0, transition: { duration: 0.2 } }}
									className="absolute p-8 border-b w-full text-center"
								>
									no tasks
								</motion.p>
							)}
						</AnimatePresence>
					)}
				</div>

				<div className="border-t p-4">
					<AddTask />
				</div>
			</div>
		</WithAnimation>
	);
}

function Task({ task }: { task: ApiTaskWithTag }) {
	return (
		<div className="px-4 py-3 flex justify-between gap-4">
			<div className="flex gap-4 items-center">
				<BaseTask task={task} />
			</div>

			<TaskMenu task={task} />
		</div>
	);
}
