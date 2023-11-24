import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";

export type StatsTimeframe = "day" | "week" | "month" | "year";

export function useStats({ date, timeframe }: { date: Date; timeframe: StatsTimeframe }) {
	return useQuery({
		queryKey: ["stats", date, timeframe],
		queryFn: ({ signal }) =>
			apiRequest<{
				timeframe: StatsTimeframe;
				start: string;
				end: string;
				stats: {
					date: string;
					seconds: number;
				}[];
			}>({
				method: "GET",
				path: "/stats",
				query: new URLSearchParams({ date: date.toISOString(), timeframe }),
				signal,
			}),
	});
}
