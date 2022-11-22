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
		<form className="flex flex-col space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
			<Input
				label="Password"
				type="password"
				error={form.formState.errors.password?.message}
				{...form.register("password")}
			/>

			<Button
				onPress={() => {
					const { username, password } = form.getValues();

					if (!username || !password) return toast.error("Please fill in all fields");

					signIn("credentials", {
						username,
						password,
						callbackUrl: "/",
					});
				}}
			>
				Login to preview
			</Button>
		</form>
	);
};
