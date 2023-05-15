import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { users } from "@tasks/data";

import { protectedProcedure, router } from "../trpc";

export const userEndpoints = router({
	me: protectedProcedure.query(async ({ ctx }) => {
		const user = (
			await ctx.db.select().from(users).where(eq(users.id, ctx.userId)).limit(1)
		)[0];

		if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
		}

		return user;
	}),
});
