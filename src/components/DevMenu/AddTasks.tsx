import { Button } from "~ui/Button";
import { trpc } from "~utils/trpc";

export const AddTasks = () => {
	const trpcCtx = trpc.useContext();

	const mutation = trpc.dev?.addTasks.useMutation({
		onSettled: () => trpcCtx.invalidate(),
	});

	return (
		<Button onClick={() => mutation.mutateAsync()} disabled={mutation.isLoading}>
			{mutation.isLoading ? "Adding..." : "Add tasks"}
		</Button>
	);
};
