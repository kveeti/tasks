import { Button } from "@/components/ui/button";
import { useStopOnGoingTask } from "@/utils/api/tasks";
import { errorToast } from "@/utils/errorToast";

export function StopTask() {
	const mutation = useStopOnGoingTask();

	function stopTask() {
		mutation.mutateAsync().catch(errorToast("error stopping task"));
	}

	return <Button onClick={stopTask}>stop</Button>;
}
