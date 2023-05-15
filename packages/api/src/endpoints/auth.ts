import { eq } from "drizzle-orm";
import { z } from "zod";

import { createId, users } from "@tasks/data";

import { createToken } from "../token";
import { publicProcedure, router } from "../trpc";

export const authEndpoints = router({
	verifyCode: publicProcedure
		.input(z.object({ code: z.string() }))
		.query(async ({ input, ctx }) => {
			console.log("verifyCode");

			const tokenQueryParams = new URLSearchParams({
				code: input.code,
				client_id: process.env.VITE_APP_G_CLIENT_ID!,
				client_secret: process.env.G_CLIENT_SECRET!,
				redirect_uri: process.env.VITE_APP_URL + "/auth/callback",
				grant_type: "authorization_code",
			});

			console.log("getting token response from google");

			const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: tokenQueryParams.toString(),
			})
				.then((res) => res.json())
				.catch((err) => console.log(err));

			const accessToken = tokenRes.access_token;

			console.log("got token response from google");

			console.log("getting user's email from google");

			const userInfo = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
				method: "GET",
				headers: { Authorization: `Bearer ${accessToken}` },
			})
				.then((res) => res.json())
				.catch((err) => console.log(err));

			const email = userInfo.email;

			console.log("got user's email from google");

			let user = (
				await ctx.db.select().from(users).where(eq(users.email, email)).limit(1)
			)[0];

			if (!user) {
				console.log("creating user");

				user = {
					id: createId(),
					createdAt: new Date(),
					email,
				};

				await ctx.db.insert(users).values(user);
			}

			console.log("upserted user", { user });

			const token = await createToken(user.id);

			ctx.res.setHeader("Set-Cookie", `token=${token}; HttpOnly; SameSite=Lax; Path=/;`);

			return user;
		}),
});
