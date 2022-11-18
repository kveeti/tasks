import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
	session: { strategy: "jwt" },
	providers: [
		env.NODE_ENV !== "production"
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
							return null;
						}

						const user = await prisma.user.findUnique({
							where: { username: credentials.username },
						});

						if (user) {
							return user;
						}

						return null;
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
			};
		},
	},
};

export default NextAuth(authOptions);
