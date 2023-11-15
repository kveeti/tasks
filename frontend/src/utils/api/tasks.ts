import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";

export type ApiTask = {
	id: string;
	user_id: string;
	tag_id: string;
	is_manual: boolean;
	started_at: string;
	expires_at: string;
	stopped_at?: string;
	created_at: string;
};

export type ApiTaskWithTag = ApiTask & {
	tag_label: string;
	tag_color: string;
};

export function useTasks() {
	return useQuery<ApiTaskWithTag[]>({
		queryKey: ["tasks"],
		queryFn: ({ signal }) =>
			apiRequest({
				signal,
				method: "GET",
				path: "/tasks",
			}),
	});
}

export function useOnGoingTask() {
	return useQuery({
		queryKey: ["onGoingTask"],
		queryFn: () =>
			apiRequest<ApiTaskWithTag>({
				method: "GET",
				path: "/tasks/on-going",
			}),
	});
}

export function useAddManualTask() {
	const queryClient = useQueryClient();

	return useMutation<
		ApiTaskWithTag,
		unknown,
		{
			tag_id: string;
			started_at: string;
			expires_at: string;
		}
	>({
		mutationFn: (variables) =>
			apiRequest({
				method: "POST",
				path: "/tasks",
				body: variables,
			}),
		onSuccess: async (newTask) => {
			queryClient.setQueryData<ApiTaskWithTag[] | undefined>(["tasks"], (oldTasks) => {
				if (oldTasks) {
					return [newTask, ...oldTasks];
				}
			});

			void queryClient.invalidateQueries(["tasks"]);
		},
	});
}

export function useStartTask() {
	const queryClient = useQueryClient();

	return useMutation<ApiTaskWithTag, unknown, { tag_id: string; expires_at: Date }>({
		mutationFn: (variables) =>
			apiRequest({
				method: "POST",
				path: "/tasks/on-going",
				body: variables,
			}),
		onSuccess: async (newTask) => {
			queryClient.setQueryData<ApiTaskWithTag[] | undefined>(["tasks"], (oldTasks) => {
				if (oldTasks) {
					return [newTask, ...oldTasks];
				}
			});

			queryClient.setQueryData<ApiTaskWithTag | undefined>(["onGoingTask"], (oldTasks) => {
				if (oldTasks) {
					return newTask;
				}
			});

			void queryClient.invalidateQueries(["tasks", "onGoingTask"]);
		},
	});
}

export function useStopOnGoingTask() {
	const queryClient = useQueryClient();

	return useMutation<ApiTaskWithTag>({
		mutationFn: (variables) =>
			apiRequest({
				method: "DELETE",
				path: "/tasks/on-going",
				body: variables,
			}),
		onSuccess: async (newTask) => {
			queryClient.setQueryData<ApiTaskWithTag[] | undefined>(["tasks"], (oldTasks) => {
				if (oldTasks) {
					return [newTask, ...oldTasks];
				}
			});

			queryClient.setQueryData<ApiTaskWithTag | undefined>(["onGoingTask"], undefined);

			void queryClient.invalidateQueries(["tasks", "onGoingTask"]);
		},
	});
}

export function useDeleteTask() {
	const queryClient = useQueryClient();

	return useMutation<unknown, unknown, { taskId: string }>({
		mutationFn: (variables) =>
			apiRequest({
				method: "DELETE",
				path: `/tasks/${variables.taskId}`,
			}),
		onSuccess: async (_, variables) => {
			queryClient.setQueryData<ApiTaskWithTag[] | undefined>(["tasks"], (oldTasks) => {
				if (oldTasks) {
					return oldTasks.filter((task) => task.id !== variables.taskId);
				}
			});

			void queryClient.invalidateQueries(["tasks"]);
		},
	});
}
