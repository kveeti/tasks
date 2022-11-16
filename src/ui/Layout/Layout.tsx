import { ReactNode } from "react";

import { NavBar } from "./Navbar";

type Props = {
	children: ReactNode;
};

export const Layout = ({ children }: Props) => {
	return (
		<>
			<NavBar />

			<main className="mx-auto max-w-page px-3 pt-[3.5rem] sm:pt-[8rem]">{children}</main>
		</>
	);
};
