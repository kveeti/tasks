import { Counter } from "@/Ui/Counter";

import { WithAnimation } from "../../../components/with-animation";
import { useTimerContext } from "../timer-context";
import { SelectTag } from "./select-tag";
import { TaskControls } from "./task-controls";
import { TimeControls } from "./time-controls";

export function AppIndexPage() {
	const { form, onGoingSeconds } = useTimerContext();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col items-center justify-center p-8">
				<span className="rounded-3xl border border-gray-800 bg-gray-950/50 p-4 font-bold text-gray-50">
					<Counter seconds={onGoingSeconds ? onGoingSeconds : form.watch("seconds")} />
				</span>

				<TimeControls />

				<SelectTag />

				<TaskControls />
			</div>
		</WithAnimation>
	);
}
