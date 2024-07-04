import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import { useOnGoingTask } from "@/lib/api/tasks";
import { createCtx } from "@/lib/create-ctx";

import { useOnGoingSeconds } from "./use-on-going-seconds";

function useStartTaskForm() {
	return useForm<{ tagId: string | null; seconds: number }>({
		defaultValues: {
			tagId: null,
			seconds: 0,
		},
	});
}
export type StartTaskForm = ReturnType<typeof useStartTaskForm>;

const [useContext, Context] = createCtx<ReturnType<typeof useContextValue>>();
export const useTimerContext = useContext;

export function TimerContext({ children }: { children: ReactNode }) {
	const value = useContextValue();

	return <Context.Provider value={value}>{children}</Context.Provider>;
}

function useContextValue() {
	const onGoingTask = useOnGoingTask();
	const onGoingSeconds = useOnGoingSeconds({ onGoingTask: onGoingTask?.data });

	const form = useStartTaskForm();

	return { onGoingSeconds, onGoingTask: onGoingTask?.data, form };
}
