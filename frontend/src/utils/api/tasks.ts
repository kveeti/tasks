import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";

export type Task = {
	id: string;
	user_id: string;
	tag_id: string;
	is_manual: boolean;
	started_at: string;
	expires_at?: string;
	stopped_at: string;
	created_at: string;
};

export type TaskWithTag = Task & {
	tag_label: string;
	tag_color: string;
};

export function useTasks() {
	return useQuery<TaskWithTag[]>({
		queryKey: ["tasks"],
		queryFn: ({ signal }) =>
			apiRequest({
				signal,
				method: "GET",
				path: "/tasks",
			}),
	});
}

export function useAddTask() {
	const queryClient = useQueryClient();

	return useMutation<
		Task,
		unknown,
		{
			tag_id: string;
			started_at: string;
			expires_at: string;
		}
	>({
		mutationFn: (props) =>
			apiRequest({
				method: "POST",
				path: "/tasks",
				body: props,
			}),
		onSuccess: async (newTask) => {
			queryClient.setQueryData<Task[] | undefined>(["tasks"], (oldTasks) => {
				if (oldTasks) {
					return [newTask, ...oldTasks];
				}
			});

			void queryClient.invalidateQueries(["tasks"]);
		},
	});
}

export async function useDeleteTask() {
	const queryClient = useQueryClient();

	return useMutation<unknown, unknown, { taskId: string }>({
		mutationFn: (variables) =>
			apiRequest({
				method: "DELETE",
				path: `/tasks/${variables.taskId}`,
			}),
		onSuccess: async (_, variables) => {
			queryClient.setQueryData<Task[] | undefined>(["tasks"], (oldTasks) => {
				if (oldTasks) {
					return oldTasks.filter((task) => task.id !== variables.taskId);
				}
			});

			void queryClient.invalidateQueries(["tasks"]);
		},
	});
}
