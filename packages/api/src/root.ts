import { authEndpoints } from "./endpoints/auth";
import { notifsEndpoints } from "./endpoints/notifs";
import { tasksEndpoints } from "./endpoints/tasks";
import { userEndpoints } from "./endpoints/users";
import { router } from "./trpc";

export const apiRouter = router({
	tasks: tasksEndpoints,
	notifs: notifsEndpoints,
	users: userEndpoints,
	auth: authEndpoints,
});

export type ApiRouter = typeof apiRouter;
