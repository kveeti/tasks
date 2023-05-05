import { tasksEndpoints } from "./endpoints/tasks";
import { userEndpoints } from "./endpoints/users";
import { router } from "./trpc";

export const apiRouter = router({
	tasks: tasksEndpoints,
	users: userEndpoints,
});

export type ApiRouter = typeof apiRouter;
