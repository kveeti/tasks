import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";

export type ApiTask = {
	id: string;
	user_id: string;
	tag_label: string;
	is_manual: boolean;
	seconds: number;
	start_at: string;
	end_at: string;
};

export type ApiTaskWithTag = ApiTask & {
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

const MAX_TASKS_PER_PAGE = 30;
export function useInfiniteTasks() {
	return useInfiniteQuery({
		queryKey: ["infinite-tasks"],
		queryFn: async ({ pageParam = "", signal }) =>
			apiRequest<ApiTaskWithTag[]>({
				method: "GET",
				path: "/tasks",
				query: new URLSearchParams({ last_id: pageParam }),
				signal,
			}),
		initialPageParam: "",
		getNextPageParam: (lastPage) =>
			lastPage.length === MAX_TASKS_PER_PAGE ? lastPage.at(-1)?.id : null,
	});
}

export function useOnGoingTask() {
	return useQuery({
		queryKey: ["on-going-task"],
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
		onSuccess: async () => {
			void queryClient.invalidateQueries({ queryKey: ["infinite-tasks"] });
		},
	});
}

export function useStartTask() {
	const queryClient = useQueryClient();

	return useMutation<ApiTaskWithTag, unknown, { tag_id: string; seconds: number }>({
		mutationFn: (variables) =>
			apiRequest({
				method: "POST",
				path: "/tasks/on-going",
				body: variables,
			}),
		onSuccess: async (newTask) => {
			queryClient.setQueryData<ApiTaskWithTag | undefined>(["on-going-task"], () => newTask);

			void queryClient.invalidateQueries({ queryKey: ["on-going-task"] });
			void queryClient.invalidateQueries({ queryKey: ["infinite-tasks"] });
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
		onSuccess: async () => {
			queryClient.setQueryData(["on-going-task"], () => null);

			void queryClient.invalidateQueries({ queryKey: ["on-going-task"] });
			void queryClient.invalidateQueries({ queryKey: ["infinite-tasks"] });
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
			const onGoingTask = queryClient.getQueryData<ApiTaskWithTag | undefined>([
				"on-going-task",
			]);
			if (onGoingTask?.id === variables.taskId) {
				queryClient.setQueryData<ApiTaskWithTag | undefined>(["on-going-task"], undefined);
			}

			void queryClient.invalidateQueries({ queryKey: ["on-going-task"] });
			void queryClient.invalidateQueries({ queryKey: ["infinite-tasks"] });
		},
	});
}
