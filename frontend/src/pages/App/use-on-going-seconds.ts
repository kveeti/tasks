import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";

import { type ApiTaskWithTag } from "@/utils/api/tasks";
import { useSetInterval } from "@/utils/useSetInterval";

export function useOnGoingSeconds({ onGoingTask }: { onGoingTask?: ApiTaskWithTag }) {
	const [onGoingSeconds, setOnGoingSeconds] = useState(0);

	useEffect(() => {
		if (!onGoingTask) return;

		setOnGoingSeconds(differenceInSeconds(new Date(onGoingTask.expires_at), new Date()));
	}, [onGoingTask]);

	useSetInterval(
		() => {
			if (!onGoingTask) return;

			setOnGoingSeconds(differenceInSeconds(new Date(onGoingTask.expires_at), new Date()));
		},
		onGoingTask ? 1000 : null
	);

	return onGoingTask ? onGoingSeconds : null;
}
