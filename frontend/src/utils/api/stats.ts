import { useQuery } from "@tanstack/react-query";

import { getTz } from "../time";
import { apiRequest } from "./apiRequest";

export type StatsPrecision = "day" | "month";

export function useHoursByStats({
	start,
	end,
	precision,
}: {
	start: Date;
	end: Date;
	precision: StatsPrecision;
}) {
	return useQuery({
		queryKey: ["stats-hours-by", start, end, precision] as const,
		queryFn: ({ signal, queryKey: [, start, end, precision] }) =>
			apiRequest<{
				precision: StatsPrecision;
				start: string;
				end: string;
				tz: string;
				most_hours: number;
				avg_hours: number;
				stats: Array<{
					date: string;
					stats: Array<{
						tag_label: string;
						tag_id: string;
						tag_color: string;
						hours: number;
					}>;
				}>;
				tags: Array<{ id: string; label: string; color: string }>;
			}>({
				method: "GET",
				path: "/stats/hours-by",
				query: {
					start: start.toISOString(),
					end: end.toISOString(),
					precision,
					tz: getTz(),
				},
				signal,
			}),
	});
}

export function useTagDistributionStats({
	end,
	start,
	precision,
}: {
	start: Date;
	end: Date;
	precision: StatsPrecision;
}) {
	return useQuery({
		queryKey: ["stats-tag-distribution", start, end, precision] as const,
		queryFn: ({ signal, queryKey: [, start, end, precision] }) =>
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
					start: start.toISOString(),
					end: end.toISOString(),
					precision,
					tz: getTz(),
				},
				signal,
			}),
	});
}
