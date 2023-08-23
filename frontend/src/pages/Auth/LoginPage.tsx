import { Button } from "@/Ui/NewButton";
import { LinkButton } from "@/Ui/NewLink";
import { useUserContext } from "@/auth";
import { createId } from "@/utils/createId";

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
				<PreviewLogin />
			)}
		</div>
	);
}

function PreviewLogin() {
	const { setUser } = useUserContext();

	function offlineLogin() {
		setUser({
			id: createId(),
			email: "offline@tasks.local",
		});
	}

	return (
		<div className="space-y-4">
			<LinkButton to={"/auth/callback"} className="px-3 py-2">
				dev login
			</LinkButton>

			<Button onPress={offlineLogin} className="px-3 py-2">
				offline login
			</Button>
		</div>
	);
}
