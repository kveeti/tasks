import { Link } from "../Ui/Link";
import { AuthLayout } from "./AuthLayout";

export function LoginPage() {
	return (
		<AuthLayout>
			<div className="flex flex-col items-center gap-10">
				<h1 className="text-5xl">Login</h1>

				<Link href={redirectUrl()}>Login with Google</Link>
			</div>
		</AuthLayout>
	);
}

function redirectUrl() {
	const queryParams = new URLSearchParams({
		client_id: import.meta.env.VITE_APP_G_CLIENT_ID,
		redirect_uri: import.meta.env.VITE_APP_G_REDIRECT_URI,
		response_type: "code",
		scope: "email",
		prompt: "select_account",
	});

	return "https://accounts.google.com/o/oauth2/v2/auth?" + queryParams.toString();
}
