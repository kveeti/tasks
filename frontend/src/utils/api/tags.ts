import { useMutation, useQuery } from "@tanstack/react-query";

import type { TagColors } from "@/pages/App/AppTagsPage/ColorSelector";

import { apiRequest } from "./apiRequest";

export function useTags() {
	return useQuery<
		{
			id: string;
			label: string;
		}[]
	>({
		queryKey: ["tags"],
		queryFn: () =>
			apiRequest({
				method: "GET",
				path: "/tags",
			}),
	});
}

export function useAddTag() {
	return useMutation<
		unknown,
		unknown,
		{
			label: string;
			color: TagColors;
		}
	>({
		mutationFn: (props) =>
			apiRequest({
				method: "POST",
				path: "/tags",
				body: props,
			}),
	});
}
