import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "./api/apiRequest";

export function useAuth() {
	return useQuery({
		queryKey: ["auth"],
		queryFn: ({ signal }) =>
			apiRequest({
				method: "GET",
				path: "/auth/me",
				signal,
			}),
	});
}
