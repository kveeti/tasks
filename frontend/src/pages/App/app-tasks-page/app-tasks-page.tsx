import { AnimatePresence, motion } from "framer-motion";

import { ExecWhenOnScreen } from "@/components/exec-when-on-screen";
import { PageLayout } from "@/components/page-layout";
import { type ApiTaskWithTag, useInfiniteTasks } from "@/utils/api/tasks";

import { AddTask } from "./add-task";
import { BaseTask } from "./base-task";
import { TaskMenu } from "./task-menu";

export function AppTasksPage() {
	const query = useInfiniteTasks();

	const months = processAndGroupTasks(query.data?.pages);

	const monthEntries = Object.entries(months);

	return (
		<PageLayout>
			<PageLayout.Title>tasks</PageLayout.Title>

			<div className="flex h-full relative flex-col overflow-auto bg-card-item">
				{query.isLoading ? null : query.isError ? (
					<p>error</p>
				) : (
					<AnimatePresence initial={false} mode="popLayout">
						<ul key="tasks" className="border-b divide-y">
							{monthEntries.map(([monthKey, tasks]) => (
								<li key={monthKey}>
									<h2 className="px-4 py-3 text-sm font-bold border-b sticky top-0 bg-card shadow-lg">
										{new Date(monthKey).toLocaleString(undefined, {
											month: "long",
											year: "numeric",
										})}
									</h2>

									<ul className="divide-y">
										{tasks.map((task) => (
											<Task key={task.id} task={task} />
										))}
									</ul>
								</li>
							))}
						</ul>

						{!monthEntries.length && (
							<motion.p
								key="no-tasks"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="absolute p-8 border-b w-full text-center"
							>
								no tasks
							</motion.p>
						)}
					</AnimatePresence>
				)}

				<ExecWhenOnScreen func={query.fetchNextPage} />
			</div>

			<PageLayout.Footer>
				<AddTask />
			</PageLayout.Footer>
		</PageLayout>
	);
}

function Task({ task }: { task: ApiTaskWithTag }) {
	return (
		<li className="px-4 py-3 flex justify-between gap-4">
			<div className="flex gap-4 items-center">
				<BaseTask task={task} />
			</div>

			<TaskMenu task={task} />
		</li>
	);
}

function groupTasksByMonth(tasks: ApiTaskWithTag[]) {
	const tasksByMonth: Record<string, ApiTaskWithTag[]> = {};

	tasks.forEach((task) => {
		const monthKey = getMonthKey(task.start_at);

		if (!tasksByMonth[monthKey]) {
			tasksByMonth[monthKey] = [];
		}

		tasksByMonth[monthKey]!.push(task);
	});

	return tasksByMonth;
}

function getMonthKey(dateString: string) {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;

	return `${year}-${month}`;
}

function processAndGroupTasks(pages: ApiTaskWithTag[][] | undefined) {
	if (!pages) return {};

	const allTasks = pages.flatMap((page) => page || []);

	const tasksByMonth = groupTasksByMonth(allTasks);

	return tasksByMonth;
}
