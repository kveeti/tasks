import { router } from "../trpc";
import { adminRouter } from "./admin-router";
import { authRouter } from "./auth";
import { meRouter } from "./me-router";

export const appRouter = router({
	auth: authRouter,
	me: meRouter,
	admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
