import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape }) {
		return shape;
	},
});

export const router = t.router;

export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.session || !ctx.session.userId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({
		ctx: {
			userId: ctx.session.userId,
			isAdmin: ctx.session.isAdmin,
		},
	});
});

const isAdmin = t.middleware(({ ctx, next }) => {
	if (!ctx.session || !ctx.session.userId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (!ctx.session.isAdmin) {
		throw new TRPCError({ code: "FORBIDDEN" });
	}
	return next({
		ctx: {
			userId: ctx.session.userId,
			isAdmin: ctx.session.isAdmin,
		},
	});
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
