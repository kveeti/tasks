import { publicProcedure, router } from "../trpc";

export const tasksEndpoints = router({
	get: publicProcedure.query(async () => {
		console.log("hete");

		return "test";
	}),
});
