import { Link } from "../../Ui/Link";

const queryParams = new URLSearchParams({
	client_id: import.meta.env.VITE_APP_G_CLIENT_ID,
	redirect_uri: import.meta.env.VITE_APP_URL + "/auth/callback",
	response_type: "code",
	scope: "email",
	prompt: "select_account",
});

const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryParams.toString()}`;

export function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-10">
			<h1 className="text-5xl">Login</h1>

			<Link href={redirectUrl} className="py-2 px-3">
				Login with Google
			</Link>
		</div>
	);
}
