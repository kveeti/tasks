import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";

export function useAuth() {
	return useQuery({
		retry: false,
		queryKey: ["auth"],
		queryFn: ({ signal }) =>
			apiRequest({
				method: "GET",
				path: "/auth/me",
				signal,
			}),
	});
}
