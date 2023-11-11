import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";

export function useTasks({ selectedDay }: { selectedDay?: Date }) {
	return useQuery<
		{
			id: string;
			started_at: string;
		}[]
	>({
		queryKey: ["tasks", selectedDay],
		queryFn: () =>
			apiRequest({
				method: "GET",
				path: "/tasks",
				...(selectedDay && {
					query: new URLSearchParams({
						day: selectedDay.toISOString(),
					}),
				}),
			}),
	});
}
