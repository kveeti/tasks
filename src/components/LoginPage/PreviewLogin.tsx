import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "~ui/Button";
import { Input } from "~ui/Input";
import { LoginForm, loginFormSchema } from "~validation/login";

export const PreviewLogin = () => {
	const router = useRouter();

	const form = useForm<LoginForm>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			username: "preview",
			password: "",
		},
	});

	const onSubmit = async (values: LoginForm) => {
		toast.promise(
			(async () => {
				const res = await signIn("credentials", {
					username: values.username,
					password: values.password,
					redirect: false,
					callbackUrl: "/",
				});

				if (!res) {
					toast.error("Network error", { id: "network-error" });
					throw new Error("Network error");
				}

				if (res?.error || !res?.ok) {
					toast.error(res.error || "Unknown error", { id: "login-error" });
					throw new Error(res.error);
				}

				router.push("/");
			})(),
			{
				loading: "Logging in...",
				success: "Logged in!",
				error: "Failed to login",
			},
			{ id: "login" }
		);
	};

	return (
		<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<div className="flex flex-col gap-2">
				<Input
					label="Username"
					autoComplete="username"
					required
					error={form.formState.errors.username?.message}
					{...form.register("username")}
				/>

				<Input
					label="Password"
					type="password"
					autoComplete="current-password"
					required
					error={form.formState.errors.password?.message}
					{...form.register("password")}
				/>
			</div>

			<Button type="submit">Login to preview</Button>
		</form>
	);
};
