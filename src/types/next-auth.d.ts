import { type DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		userId: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		userId: string;
	}
}
