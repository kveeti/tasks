import Head from "next/head";
import type { ReactNode } from "react";

import { NavBar } from "./Navbar";

type Props = {
	title: string;
	children: ReactNode;
};

export const Layout = ({ children, title }: Props) => {
	return (
		<>
			<Head>
				<title>{`Tasks | ${title}`}</title>
			</Head>

			<NavBar />

			<main className="mx-auto h-max max-w-page px-3 pb-[6rem] pt-[5rem] sm:pt-[7rem]">
				{children}
			</main>
		</>
	);
};
