import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "~ui/Button";
import { Input } from "~ui/Input";
import { LoginForm, loginFormSchema } from "~validation/login";

export const PreviewLogin = () => {
	const form = useForm<LoginForm>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			username: "preview",
			password: "",
		},
	});

	const onSubmit = (values: LoginForm) => {
		toast.promise(
			signIn("credentials", {
				username: values.username,
				password: values.password,
				callbackUrl: "/",
			}),
			{
				loading: "Logging in...",
				success: "Logged in!",
				error: "Failed to log in.",
			}
		);
	};

	return (
		<form className="flex flex-col space-y-2" onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<Input
				label="Password"
				type="password"
				required
				error={form.formState.errors.password?.message}
				{...form.register("password")}
			/>

			<Button type="submit">Login to preview</Button>
		</form>
	);
};
