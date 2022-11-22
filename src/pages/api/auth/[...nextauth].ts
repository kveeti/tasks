import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { safeEqual } from "~server/common/timingSafeEqual";
import { loginFormSchema } from "~validation/login";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
	session: { strategy: "jwt" },
	pages: {
		signIn: "/login",
	},
	providers: [
		env.ENV === "production"
			? GoogleProvider({
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					clientId: env.G_CLIENT_ID!,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					clientSecret: env.G_CLIENT_SECRET!,
					authorization: {
						params: {
							scope: "email",
							prompt: "select_account",
						},
					},
			  })
			: Credentials({
					name: "username",
					type: "credentials",
					credentials: {
						username: {
							label: "Username",
							type: "text",
							placeholder: "tester",
						},
					},
					async authorize(credentials) {
						if (!credentials) {
							throw new Error("No credentials provided");
						}

						if (!env.PREVIEW_PASSWORD) {
							throw new Error("PREVIEW_PASSWORD not set");
						}

						const result = await loginFormSchema.safeParseAsync(credentials);
						if (!result.success) {
							throw new Error("Invalid credentials");
						}

						const { username, password } = result.data;

						const user = await prisma.user.findUnique({
							where: { username },
						});

						if (!user) {
							throw new Error("Invalid username");
						}

						const validPassword = safeEqual(env.PREVIEW_PASSWORD, password);

						if (!validPassword) {
							throw new Error("Invalid password");
						}

						return user;
					},
			  }),
	],

	callbacks: {
		async signIn(params) {
			if (!params?.user?.email) return false;

			const user = await prisma.user.upsert({
				where: { email: params.user.email },
				create: { email: params.user.email },
				update: {},
			});

			if (user) {
				return true;
			}

			return false;
		},
		async jwt(params) {
			if (!params?.user?.email) return params.token;

			const user = await prisma.user.findUnique({
				where: { email: params.user.email },
			});

			if (!user) return params.token;

			return {
				userId: user.id,
				isAdmin: user.isAdmin,
				email: user.email,
				iat: params.token.iat,
				exp: params.token.exp,
				jti: params.token.jti,
			};
		},
		session(params) {
			return {
				expires: params.session.expires,
				userId: params.token.userId,
				isAdmin: params.token.isAdmin,
			};
		},
	},
};

export default NextAuth(authOptions);
