import { useForm } from "react-hook-form";

import { Time } from "@/Ui/Counter";
import { useOnGoingTask } from "@/utils/api/tasks";

import { WithAnimation } from "../WithAnimation";
import { SelectTag } from "./select-tag";
import { StartTask } from "./start-task";
import { TimeControls } from "./time-controls";

function useStartTaskForm() {
	return useForm<{ tagId: string | null; seconds: number }>({
		defaultValues: {
			tagId: null,
			seconds: 0,
		},
	});
}

export type StartTaskForm = ReturnType<typeof useStartTaskForm>;

export function AppIndexPage() {
	const onGoingTask = useOnGoingTask();

	const form = useStartTaskForm();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col items-center justify-center p-8">
				<h2 className="rounded-3xl border border-gray-800 bg-gray-950/50 p-4 font-bold text-gray-50">
					<Time seconds={0} />
				</h2>

				<TimeControls form={form} />

				<SelectTag form={form} />

				<StartTask form={form} />
			</div>
		</WithAnimation>
	);
}
