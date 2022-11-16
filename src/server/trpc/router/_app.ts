import { router } from "../trpc";
import { authRouter } from "./auth";
import { meRouter } from "./me-router";

export const appRouter = router({
	auth: authRouter,
	me: meRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
