import { z } from "zod";

import { publicProcedure, router } from "../trpc";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

import { v4 as uuidv4 } from "uuid";
import { createToken } from "../token";

export const authEndpoints = router({
	verifyCode: publicProcedure
		.input(z.object({ code: z.string() }))
		.query(async ({ input, ctx }) => {
			const tokenQueryParams = new URLSearchParams({
				code: input.code,
				client_id: process.env.VITE_APP_G_CLIENT_ID!,
				client_secret: process.env.G_CLIENT_SECRET!,
				redirect_uri: process.env.VITE_APP_URL + "/auth/callback",
				grant_type: "authorization_code",
			});

			const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: tokenQueryParams.toString(),
			})
				.then((res) => res.json())
				.catch((err) => console.log(err));

			const accessToken = tokenRes.access_token;

			const userInfo = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
				method: "GET",
				headers: { Authorization: `Bearer ${accessToken}` },
			})
				.then((res) => res.json())
				.catch((err) => console.log(err));

			const email = userInfo.email;

			let user = (
				await ctx.db.select().from(users).where(eq(users.email, email)).limit(1)
			)[0];

			if (!user) {
				const newUserId = uuidv4();
				const newUser = {
					id: newUserId,
					email,
					createdAt: new Date(),
				};

				await ctx.db.insert(users).values(newUser);

				user = newUser;
			}

			const token = await createToken(user.id);

			ctx.res.setHeader("Set-Cookie", `token=${token}; HttpOnly; SameSite=Lax; Path=/;`);

			return user;
		}),
});
