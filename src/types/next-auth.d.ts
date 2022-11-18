import "next-auth";

declare module "next-auth" {
	interface Session {
		userId: string;
		expires: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		userId: string;
	}
}
