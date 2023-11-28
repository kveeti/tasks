import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-10">
			<h1 className="text-5xl">login</h1>

			<Button asChild>
				<Link to={`${import.meta.env.VITE_APP_API_URL}/auth/google-init`}>
					login with google
				</Link>
			</Button>

			{!import.meta.env.PROD && (
				<Button asChild className="-mt-6">
					<Link to={`${import.meta.env.VITE_APP_API_URL}/auth/dev-login`}>dev login</Link>
				</Button>
			)}
		</div>
	);
}
