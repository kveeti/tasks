import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";

import { apiRequest } from "@/utils/api/apiRequest";
import type { ApiTaskWithTag } from "@/utils/api/tasks";
import { createCtx } from "@/utils/createCtx";

const [useContextInner, Context] = createCtx<ReturnType<typeof useContextValue>>();

export const useTimerContext = useContextInner;

export function TimerContextProvider(props: { children: ReactNode }) {
	const contextValue = useContextValue();

	return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
}

function useContextValue() {
	const onGoingTaskQuery = useQuery({
		queryKey: ["onGoingTask"],
		queryFn: () =>
			apiRequest<ApiTaskWithTag>({
				method: "GET",
				path: "/tasks/ongoing",
			}),
	});

	const onGoingTask = onGoingTaskQuery.data;

	if (onGoingTaskQuery.isLoading) {
		return {
			isLoading: true,
		};
	}

	if (onGoingTaskQuery.isError) {
		return {
			isLoading: false,
			error: onGoingTaskQuery.error,
		};
	}

	return {
		tag_id: onGoingTask?.tag_id,
		tag_label: onGoingTask?.tag_label,
		tag_color: onGoingTask?.tag_color,
	};
}
