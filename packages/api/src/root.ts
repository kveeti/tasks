import { authEndpoints } from "./endpoints/auth";
import { notifsEndpoints } from "./endpoints/notifs";
import { syncEndpoints } from "./endpoints/sync";
import { tasksEndpoints } from "./endpoints/tasks";
import { userEndpoints } from "./endpoints/users";
import { router } from "./trpc";

export const apiRouter = router({
	tasks: tasksEndpoints,
	notifs: notifsEndpoints,
	users: userEndpoints,
	auth: authEndpoints,
	sync: syncEndpoints,
});

export type ApiRouter = typeof apiRouter;
