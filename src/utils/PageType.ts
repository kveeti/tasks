import { NextPage } from "next";

export type Page = NextPage & {
	requireAuth: boolean;
};
