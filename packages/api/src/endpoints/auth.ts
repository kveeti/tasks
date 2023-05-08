import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const authEndpoints = router({
	verifyCode: publicProcedure.input(z.object({ code: z.string() })).query(async ({ input }) => {
		console.log("test");

		const tokenQueryParams = new URLSearchParams({
			code: input.code,
			client_id: process.env.VITE_APP_G_CLIENT_ID!,
			client_secret: process.env.G_CLIENT_SECRET!,
			redirect_uri: process.env.VITE_APP_G_REDIRECT_URI!,
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

		console.log({ email });

		return "ok";
	}),
});
