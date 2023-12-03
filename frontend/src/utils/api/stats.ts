import { useQuery } from "@tanstack/react-query";

import { getTz } from "../time";
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
				most_hours: number;
				stats: Array<{ date: string; hours: number }>;
			}>({
				method: "GET",
				path: "/stats/hours-by",
				query: {
					date: date.toISOString(),
					precision,
					tz: getTz(),
				},
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
				stats: Array<{
					tag_label: string;
					tag_color: string;
					seconds: number;
					percentage: number;
				}>;
			}>({
				method: "GET",
				path: "/stats/tag-distribution",
				query: {
					date: queryKey[1].toISOString(),
					precision: queryKey[2],
					tz: getTz(),
				},
				signal,
			}),
	});
}
