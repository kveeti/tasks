import { TRPCError, type inferAsyncReturnType, initTRPC } from "@trpc/server";
import { type CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import superjson from "superjson";

import { db } from "@tasks/data";

import { verifyToken } from "./token";

export async function createContext(opts: CreateHTTPContextOptions) {
	let token =
		opts.req.headers.authorization?.replace("Bearer ", "") ||
		opts.req.headers.cookie?.split("=")[1]?.split(";")?.[0] ||
		"";

	const userId = token
		? await verifyToken(token)
				.then((v) => v.payload.userId)
				.catch(() => null)
		: null;

	return { db, userId, res: opts.res };
}

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.userId) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing Bearer token" });
	}

	return next({
		ctx: { userId: ctx.userId },
	});
});

export const protectedProcedure = t.procedure.use(isAuthed);
