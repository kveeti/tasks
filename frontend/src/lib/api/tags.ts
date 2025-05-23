import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";
import type { TagColor } from "./types";

export type ApiTag = {
	id: string;
	label: string;
	color: TagColor;
	last_used_at: Date;
};

export function useTags() {
	return useQuery<Array<ApiTag>>({
		queryKey: ["tags"],
		queryFn: ({ signal }) =>
			apiRequest({
				signal,
				method: "GET",
				path: "/tags",
			}),
	});
}
export function useEditTag() {
	const queryClient = useQueryClient();

	return useMutation<ApiTag, unknown, { tagId: string; label: string; color: TagColor }>({
		mutationFn: (variables) =>
			apiRequest({
				method: "PATCH",
				path: `/tags/${variables.tagId}`,
				body: variables,
			}),
		onSuccess: async (result) => {
			queryClient.setQueryData<Array<ApiTag> | undefined>(["tags"], (oldTags) => {
				if (oldTags) {
					return oldTags.map((tag) => {
						if (tag.id === result.id) {
							return result;
						}

						return tag;
					});
				}
			});

			void queryClient.invalidateQueries({ queryKey: ["tags"], refetchType: "all" });
			void queryClient.invalidateQueries({ queryKey: ["on-going-task"], refetchType: "all" });
			void queryClient.invalidateQueries({
				queryKey: ["infinite-tasks"],
				refetchType: "all",
			});
		},
	});
}

export function useAddTag() {
	const queryClient = useQueryClient();

	return useMutation<ApiTag, unknown, { label: string; color: TagColor }>({
		mutationFn: (variables) =>
			apiRequest({
				method: "POST",
				path: "/tags",
				body: variables,
			}),
		onSuccess: async (result) => {
			queryClient.setQueryData<Array<ApiTag> | undefined>(["tags"], (oldTags) => {
				if (oldTags) {
					return [result, ...oldTags];
				}
			});

			void queryClient.invalidateQueries({ queryKey: ["tags"], refetchType: "all" });
		},
	});
}

export function useDeleteTag() {
	const queryClient = useQueryClient();

	return useMutation<unknown, unknown, { tagId: string }>({
		mutationFn: (variables) =>
			apiRequest({
				method: "DELETE",
				path: `/tags/${variables.tagId}`,
			}),
		onSuccess: async (_, variables) => {
			queryClient.setQueryData<Array<ApiTag> | undefined>(["tags"], (oldTags) => {
				if (oldTags) {
					return oldTags.filter((tag) => tag.id !== variables.tagId);
				}
			});

			void queryClient.invalidateQueries({ queryKey: ["tags"], refetchType: "all" });
			void queryClient.invalidateQueries({ queryKey: ["on-going-task"], refetchType: "all" });
			void queryClient.invalidateQueries({
				queryKey: ["infinite-tasks"],
				refetchType: "all",
			});
		},
	});
}
