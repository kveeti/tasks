import { Link } from "../../Ui/Link";

export function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-10">
			<h1 className="text-5xl">Login</h1>

			<Link
				href={`${import.meta.env.VITE_APP_API_URL}/auth/google-init`}
				className="px-3 py-2"
			>
				Login with Google
			</Link>
		</div>
	);
}
