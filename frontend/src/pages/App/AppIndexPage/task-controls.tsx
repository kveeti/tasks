import { addSeconds } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useStartTask, useStopOnGoingTask } from "@/utils/api/tasks";
import { errorToast } from "@/utils/errorToast";

import { useTimerContext } from "../timer-context";

export function TaskControls() {
	const { onGoingTask } = useTimerContext();

	return onGoingTask ? <StopTask /> : <StartTask />;
}

export function StartTask() {
	const { form } = useTimerContext();
	const mutation = useStartTask();

	function stopTask() {
		const { seconds, tagId } = form.getValues();

		if (!tagId) return toast.error("select a tag first");
		if (!seconds) return toast.error("add some time first");

		mutation
			.mutateAsync({
				tag_id: tagId,
				expires_at: addSeconds(new Date(), seconds),
			})
			.then(() => form.reset())
			.catch(errorToast("error starting task"));
	}

	return (
		<Button className="mt-8 px-10 py-7" onClick={stopTask}>
			start
		</Button>
	);
}

export function StopTask() {
	const mutation = useStopOnGoingTask();

	function stopTask() {
		mutation.mutateAsync().catch(errorToast("error stopping task"));
	}

	return (
		<Button className="mt-8 px-10 py-7" onClick={stopTask}>
			stop
		</Button>
	);
}
