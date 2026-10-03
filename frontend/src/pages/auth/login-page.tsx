import { Button } from "@/components/ui/button";
import { conf } from "@/lib/conf";

const apiUrl = conf.API_URL;

export function LoginPage() {
	return (
		<div className="flex flex-col items-center gap-10">
			<h1 className="text-5xl">login</h1>

			<Button asChild>
				<a href={`${apiUrl}/auth/google-init`}>login with google</a>
			</Button>

			{!conf.IS_PROD && (
				<Button asChild className="-mt-6">
					<a href={`${apiUrl}/auth/dev-login`}>dev login</a>
				</Button>
			)}
		</div>
	);
}
