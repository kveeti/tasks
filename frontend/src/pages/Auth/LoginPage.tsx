import { LinkButton } from "@/Ui/NewLink";

export function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-10">
			<h1 className="text-5xl">Login</h1>

			{import.meta.env.PROD ? (
				<LinkButton
					to={`${import.meta.env.VITE_APP_API_URL}/auth/google-init`}
					className="px-3 py-2"
				>
					Login with Google
				</LinkButton>
			) : (
				<LinkButton
					to={`${import.meta.env.VITE_APP_API_URL}/auth/dev-login`}
					className="px-3 py-2"
				>
					dev login
				</LinkButton>
			)}
		</div>
	);
}
