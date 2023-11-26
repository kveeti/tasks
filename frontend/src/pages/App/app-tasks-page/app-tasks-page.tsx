import { AnimatePresence, motion } from "framer-motion";

import { ExecWhenOnScreen } from "@/components/exec-when-on-screen";
import { PageLayout } from "@/components/page-layout";
import { WithEnterExitAnimation } from "@/components/with-initial-animation";
import { type ApiTaskWithTag, useInfiniteTasks } from "@/utils/api/tasks";

import { AddTask } from "./add-task";
import { BaseTask } from "./base-task";
import { TaskMenu } from "./task-menu";

export function AppTasksPage() {
	const tasks2 = useInfiniteTasks();
	return (
		<PageLayout>
			<PageLayout.Title>tasks</PageLayout.Title>

			<div className="flex h-full relative flex-col overflow-auto bg-card-item">
				{tasks2.isLoading ? null : tasks2.isError ? (
					<p>error</p>
				) : (
					<AnimatePresence initial={false} mode="popLayout">
						<ul key="tasks" className="border-b divide-y">
							<AnimatePresence initial={false}>
								{tasks2.data?.pages.map((page) =>
									page.map((task) => (
										<li key={task.id}>
											<WithEnterExitAnimation>
												<Task task={task} />
											</WithEnterExitAnimation>
										</li>
									))
								)}
							</AnimatePresence>
						</ul>

						{!tasks2.data?.pages.length && (
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

				<ExecWhenOnScreen func={tasks2.fetchNextPage} />
			</div>

			<PageLayout.Footer>
				<AddTask />
			</PageLayout.Footer>
		</PageLayout>
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
