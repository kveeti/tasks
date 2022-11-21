import type { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import type { AppType } from "next/app";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { TimerContextProvider } from "~components/IndexPage/Timer/TimerContext";
import type { Page } from "~utils/PageType";
import { colors } from "~utils/colors";

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
						background: colors.p[1000],
						border: `1px solid ${colors.p[800]}`,
						color: colors.p[100],
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
					<Auth requireAdmin={(Component as Page).requireAdmin}>
						<TimerContextProvider>
							<Component {...pageProps} />
						</TimerContextProvider>
					</Auth>
				) : (
					<Component {...pageProps} />
				)}
			</SessionProvider>
		</>
	);
};

const Auth = ({ children, requireAdmin }: { children: ReactNode; requireAdmin: boolean }) => {
	const { status, data } = useSession({ required: true });
	const router = useRouter();

	if (status === "loading") {
		return <></>;
	} else if (requireAdmin && !data.isAdmin) {
		router.push("/");
		return <></>;
	} else if (status === "authenticated") {
		return <>{children}</>;
	} else {
		return <></>;
	}
};

export default trpc.withTRPC(MyApp);
