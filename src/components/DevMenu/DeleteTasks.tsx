import { Button } from "~ui/Button";
import { trpc } from "~utils/trpc";

export const DeleteTasks = () => {
	const trpcCtx = trpc.useContext();

	const mutation = trpc.dev?.deleteTasks.useMutation({
		onSettled: () => trpcCtx.invalidate(),
	});

	return (
		<Button onClick={() => mutation.mutateAsync()} disabled={mutation.isLoading}>
			{mutation.isLoading ? "Deleting..." : "Delete tasks"}
		</Button>
	);
};
