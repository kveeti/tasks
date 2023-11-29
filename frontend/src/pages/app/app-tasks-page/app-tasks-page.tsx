import { AnimatePresence, motion } from "framer-motion";

import { ExecWhenOnScreen } from "@/components/exec-when-on-screen";
import { PageLayout } from "@/components/page-layout";
import { type ApiTaskWithTag, useInfiniteTasks } from "@/utils/api/tasks";
import { formatMonth } from "@/utils/time";

import { AddTask } from "./add-task";
import { BaseTask } from "./base-task";
import { TaskMenu } from "./task-menu";

export function AppTasksPage() {
	const query = useInfiniteTasks();

	return (
		<PageLayout>
			<PageLayout.Title>tasks</PageLayout.Title>

			<main className="flex h-full relative flex-col overflow-auto bg-card-item">
				{query.isLoading ? null : query.isError ? (
					<p>error</p>
				) : query.data?.pages ? (
					<Tasks pages={query.data?.pages} />
				) : null}

				<ExecWhenOnScreen func={query.fetchNextPage} />
			</main>

			<PageLayout.Footer>
				<AddTask />
			</PageLayout.Footer>
		</PageLayout>
	);
}

function Tasks(props: { pages: ApiTaskWithTag[][] }) {
	const months = groupTasksByMonth(props.pages);
	const monthEntries = Object.entries(months);

	return (
		<AnimatePresence initial={false} mode="popLayout">
			<ul key="tasks" className="border-b divide-y">
				{monthEntries.map((monthEntry) => (
					<li key={monthEntry[0]}>
						<h2 className="px-4 py-3 text-sm font-bold border-b sticky top-0 bg-card shadow-lg">
							{formatMonth(new Date(monthEntry[0]))}
						</h2>

						<ul className="divide-y">
							{monthEntry[1].map((task) => (
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
	);
}

function Task(props: { task: ApiTaskWithTag }) {
	return (
		<li className="px-4 py-3 flex justify-between items-center gap-4">
			<div className="flex gap-4 items-center">
				<BaseTask task={props.task} />
			</div>

			<TaskMenu task={props.task} />
		</li>
	);
}

function groupTasksByMonth(pages: ApiTaskWithTag[][]) {
	const tasksByMonth: Record<string, ApiTaskWithTag[]> = {};

	for (const page of pages) {
		for (const task of page) {
			const monthKey = getMonthKey(task.start_at);

			let month = tasksByMonth[monthKey];
			if (!month) {
				month = [task];
			} else {
				month.push(task);
			}

			tasksByMonth[monthKey] = month;
		}
	}

	return tasksByMonth;
}

function getMonthKey(dateString: string) {
	const year = dateString.slice(0, 4);
	const month = dateString.slice(5, 7);

	return year + "-" + month;
}
