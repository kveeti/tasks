import differenceInMinutes from "date-fns/differenceInMinutes";
import isSameMonth from "date-fns/isSameMonth";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/db/db";

export function useMonthsTasks(props: { date: Date }) {
	const monthsTasks = useLiveQuery(() =>
		db.tasks.filter((task) => isSameMonth(props.date, task.createdAt)).toArray()
	);

	// monthsTasks is of type Task[]:
	// type Task = {
	// 	   id: <task_ulid>;
	// 	   tag: {
	// 		   id: <tag_ulid>;
	// 		   label: <tag_label>;
	// 		   color: <tag_color>;
	// 	   };
	// 	   userId: <user_ulid>;
	// 	   expiresAt: Date;
	// 	   createdAt: Date;
	// 	   stoppedAt: Date | null;
	// }

	// Wanted data format:
	// [
	//     {
	//         id: <tag_ulid>,
	//         label: <tag_label>,
	//         value: <number_of_task_minutes>,
	//     },
	// ]

	// calculate task minutes from task.createdAt and task.stoppedAt or task.expiresAt

	return monthsTasks?.reduce((acc, task) => {
		const tag = task.tag;

		const tagIndex = acc.findIndex((tag) => tag.id === task.tag.id);

		const currentTaskMinutes = task.stoppedAt
			? differenceInMinutes(task.stoppedAt, task.createdAt)
			: differenceInMinutes(task.expiresAt, task.createdAt);

		if (tagIndex === -1) {
			acc.push({
				id: tag.id,
				label: tag.label,
				value: currentTaskMinutes,
			});
		} else {
			acc[tagIndex]!.value += currentTaskMinutes;
		}

		return acc;
	}, [] as { id: string; label: string; value: number }[]);
}
