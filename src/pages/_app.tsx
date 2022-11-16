import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { type AppType } from "next/app";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { Page } from "~utils/PageType";

import "../styles/globals.css";
import { trpc } from "../utils/trpc";

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<>
			<Toaster
				reverseOrder
				toastOptions={{
					style: {
						background: "#292524",
						border: "1px solid #44403c",
						color: "#f5f5f4",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						padding: "1rem",
						gap: "0.3rem",
						fontWeight: 500,
						lineHeight: 1,
					},

					position: "top-right",
				}}
			/>
			<SessionProvider session={session}>
				{(Component as Page).requireAuth ? (
					<Auth>
						<Component {...pageProps} />
					</Auth>
				) : (
					<Component {...pageProps} />
				)}
			</SessionProvider>
		</>
	);
};

const Auth = ({ children }: { children: ReactNode }) => {
	const { status } = useSession({ required: true });

	if (status === "authenticated") return <>{children}</>;
	else return <></>;
};

export default trpc.withTRPC(MyApp);
