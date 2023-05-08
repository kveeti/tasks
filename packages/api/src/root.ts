import { authEndpoints } from "./endpoints/auth";
import { tasksEndpoints } from "./endpoints/tasks";
import { userEndpoints } from "./endpoints/users";
import { router } from "./trpc";

export const apiRouter = router({
	tasks: tasksEndpoints,
	users: userEndpoints,
	auth: authEndpoints,
});

export type ApiRouter = typeof apiRouter;
