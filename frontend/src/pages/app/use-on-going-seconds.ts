import { useQueryClient } from "@tanstack/react-query";
import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";

import { type ApiTaskWithTag } from "@/lib/api/tasks";
import { useSetInterval } from "@/lib/hooks/use-set-interval";

export function useOnGoingSeconds({ onGoingTask }: { onGoingTask?: ApiTaskWithTag }) {
	const [onGoingSeconds, setOnGoingSeconds] = useState(0);

	const queryClient = useQueryClient();

	function updateSeconds() {
		if (!onGoingTask) return;

		const diff = differenceInSeconds(new Date(onGoingTask.end_at), new Date());

		if (diff === 0 && onGoingSeconds === 0) {
			queryClient.resetQueries({ queryKey: ["on-going-task"] });
			queryClient.invalidateQueries({ queryKey: ["infinite-tasks"], refetchType: "all" });
		}

		setOnGoingSeconds(diff);
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => updateSeconds(), [onGoingTask, queryClient]);
	useSetInterval(() => updateSeconds(), onGoingTask ? 1000 : null);

	return onGoingTask ? onGoingSeconds : null;
}
