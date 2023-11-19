import { useQueryClient } from "@tanstack/react-query";
import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";

import { type ApiTaskWithTag } from "@/utils/api/tasks";
import { useSetInterval } from "@/utils/useSetInterval";

export function useOnGoingSeconds({ onGoingTask }: { onGoingTask?: ApiTaskWithTag }) {
	const [onGoingSeconds, setOnGoingSeconds] = useState(0);

	const queryClient = useQueryClient();

	function updateSeconds() {
		if (!onGoingTask) return;

		const diff = differenceInSeconds(new Date(onGoingTask.expires_at), new Date());

		setOnGoingSeconds(diff);

		if (diff === 0) {
			queryClient.setQueryData(["on-going-task"], () => null);
			queryClient.invalidateQueries({ queryKey: ["on-going-task"] });
			queryClient.invalidateQueries({ queryKey: ["infinite-tasks"] });
		}
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => updateSeconds(), [onGoingTask, queryClient]);
	useSetInterval(() => updateSeconds(), onGoingTask ? 1000 : null);

	return onGoingTask ? onGoingSeconds : null;
}
