import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "./apiRequest";

export type StatsPrecision = "day" | "week" | "month";

export function useHoursByStats({ date, precision }: { date: Date; precision: StatsPrecision }) {
	return useQuery({
		queryKey: ["stats-hours-by", date, precision],
		queryFn: ({ signal }) =>
			apiRequest<{
				precision: StatsPrecision;
				start: string;
				end: string;
				tz: string;
				stats: {
					date: string;
					hours: number;
				}[];
			}>({
				method: "GET",
				path: "/stats/hours-by",
				query: new URLSearchParams({
					date: date.toISOString(),
					precision,
					tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
				}),
				signal,
			}),
	});
}

export function useTagDistributionStats({
	date,
	precision,
}: {
	date: Date;
	precision: StatsPrecision;
}) {
	return useQuery({
		queryKey: ["stats-tag-distribution", date, precision] as const,
		queryFn: ({ queryKey, signal }) =>
			apiRequest<{
				precision: StatsPrecision;
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
					precision: queryKey[2],
				}),
				signal,
			}),
	});
}
