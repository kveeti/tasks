import { useMutation, useQuery } from "@tanstack/react-query";

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

export function useGoogleVerifyMutation() {
	return useMutation({
		mutationKey: ["auth", "google-verify"],
		mutationFn: async ({ code }: { code: string }) =>
			apiRequest({
				method: "POST",
				path: "/auth/google-verify",
				query: { code },
			}),
	});
}
