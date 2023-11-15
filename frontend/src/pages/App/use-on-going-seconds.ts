import { differenceInSeconds } from "date-fns";
import { useState } from "react";

import { useOnGoingTask } from "@/utils/api/tasks";
import { useSetInterval } from "@/utils/useSetInterval";

export function useOnGoingSeconds() {
	const onGoingTask = useOnGoingTask();
	const [onGoingSeconds, setOnGoingSeconds] = useState(0);

	useSetInterval(
		() => {
			if (!onGoingTask.data) return;

			setOnGoingSeconds(
				differenceInSeconds(new Date(), new Date(onGoingTask.data.started_at))
			);
		},
		onGoingTask ? 1000 : null
	);

	return onGoingTask.data ? onGoingSeconds : null;
}
