import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";

export type StatsTimeframe = "day" | "week" | "month" | "year";

export function useHoursByStats({ date, timeframe }: { date: Date; timeframe: StatsTimeframe }) {
	return useQuery({
		queryKey: ["stats-hours-by", date, timeframe],
		queryFn: ({ signal }) =>
			apiRequest<{
				timeframe: StatsTimeframe;
				start: string;
				end: string;
				stats: {
					date: string;
					hours: number;
				}[];
			}>({
				method: "GET",
				path: "/stats/hours-by",
				query: new URLSearchParams({ date: date.toISOString(), timeframe }),
				signal,
			}),
	});
}

export function useTagDistributionStats({
	date,
	timeframe,
}: {
	date: Date;
	timeframe: StatsTimeframe;
}) {
	return useQuery({
		queryKey: ["stats-tag-distribution", date, timeframe] as const,
		queryFn: ({ queryKey, signal }) =>
			apiRequest<{
				timeframe: StatsTimeframe;
				start: string;
				end: string;
				total_seconds: number;
				stats: {
					tag_label: string;
					tag_color: string;
					seconds: number;
					percentage: number;
				}[];
			}>({
				method: "GET",
				path: "/stats/tag-distribution",
				query: new URLSearchParams({
					date: queryKey[1].toISOString(),
					timeframe: queryKey[2],
				}),
				signal,
			}),
	});
}
