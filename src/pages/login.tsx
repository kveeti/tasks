import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { PreviewLogin } from "~components/LoginPage/PreviewLogin";
import { env } from "~env/client.mjs";
import { Button } from "~ui/Button";
import type { Page } from "~utils/PageType";

export const LoginPage: Page = () => {
	const { status } = useSession();
	const router = useRouter();

	if (status === "authenticated") {
		toast.success("Logged in!", { id: "login" });
		router.push("/");
	}

	return (
		<main className="mt-[25rem] flex w-screen justify-center">
			<div className="flex flex-col space-y-10">
				<h1 className="text-center text-5xl font-bold">Tasks | Login</h1>

				{env.NEXT_PUBLIC_ENV !== "production" ? (
					<PreviewLogin />
				) : (
					<Button onPress={() => signIn("google", { callbackUrl: "/" })}>
						Login with Google
					</Button>
				)}
			</div>
		</main>
	);
};

LoginPage.requireAuth = false;
LoginPage.requireAdmin = false;

export default LoginPage;
