import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-10">
			<h1 className="text-5xl">login</h1>

			{import.meta.env.PROD ? (
				<Button asChild>
					<Link
						className="px-3 py-2"
						to={`${import.meta.env.VITE_APP_API_URL}/auth/google-init`}
					>
						login with google
					</Link>
				</Button>
			) : (
				<Button asChild>
					<Link
						className="px-3 py-2"
						to={`${import.meta.env.VITE_APP_API_URL}/auth/dev-login`}
					>
						dev login
					</Link>
				</Button>
			)}
		</div>
	);
}
