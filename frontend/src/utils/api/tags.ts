import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { TagColors } from "@/pages/App/AppTagsPage/ColorSelector";

import { apiRequest } from "./apiRequest";

export type Tag = {
	id: string;
	label: string;
	color: TagColors;
};

export function useTags() {
	return useQuery<Tag[]>({
		queryKey: ["tags"],
		queryFn: ({ signal }) =>
			apiRequest({
				signal,
				method: "GET",
				path: "/tags",
			}),
	});
}

export function useAddTag() {
	const queryClient = useQueryClient();

	return useMutation<Tag, unknown, { label: string; color: TagColors }>({
		mutationFn: (variables) =>
			apiRequest({
				method: "POST",
				path: "/tags",
				body: variables,
			}),
		onSuccess: async (result) => {
			queryClient.setQueryData<Tag[] | undefined>(["tags"], (oldTags) => {
				if (oldTags) {
					return [result, ...oldTags];
				}
			});

			void queryClient.invalidateQueries(["tags"]);
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
			queryClient.setQueryData<Tag[] | undefined>(["tags"], (oldTags) => {
				if (oldTags) {
					return oldTags.filter((tag) => tag.id !== variables.tagId);
				}
			});

			void queryClient.invalidateQueries(["tags"]);
		},
	});
}
