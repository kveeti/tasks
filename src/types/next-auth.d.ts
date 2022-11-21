import "next-auth";

declare module "next-auth" {
	interface Session {
		expires: string;
		userId: string;
		isAdmin: boolean;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		userId: string;
		isAdmin: boolean;
	}
}
