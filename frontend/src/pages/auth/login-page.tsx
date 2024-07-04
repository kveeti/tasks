import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { conf } from "@/lib/conf";

const apiUrl = conf.API_URL;

export function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-10">
			<h1 className="text-5xl">login</h1>

			<Button asChild>
				<Link to={`${apiUrl}/auth/google-init`}>login with google</Link>
			</Button>

			{!conf.IS_PROD && (
				<Button asChild className="-mt-6">
					<Link to={`${apiUrl}/auth/dev-login`}>dev login</Link>
				</Button>
			)}
		</div>
	);
}
