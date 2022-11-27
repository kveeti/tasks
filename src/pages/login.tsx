import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { PreviewLogin } from "~components/LoginPage/PreviewLogin";
import { Button } from "~ui/Button";
import type { Page } from "~utils/PageType";
import { useIsProd } from "~utils/useIsProd";

export const LoginPage: Page = () => {
	const { status } = useSession();
	const router = useRouter();
	const inProd = useIsProd();

	if (status === "authenticated") {
		toast.success("Logged in!", { id: "login" });
		router.push("/");
	}

	const title = `Tasks | ${!inProd ? "Preview login" : "Login"} `;

	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>

			<main className="mt-[30vh] flex w-screen justify-center">
				<div className="flex flex-col space-y-10">
					<h1 className="text-center text-5xl font-bold">{title}</h1>

					<div className="mx-auto flex w-full max-w-[290px] flex-col items-center">
						{inProd ? (
							<PreviewLogin />
						) : (
							<Button
								onClick={() => signIn("google", { callbackUrl: "/" })}
								className="w-max"
							>
								Login with Google
							</Button>
						)}
					</div>
				</div>
			</main>
		</>
	);
};

LoginPage.requireAuth = false;
LoginPage.requireAdmin = false;

export default LoginPage;
