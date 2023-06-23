import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { z } from "zod";

import { Input } from "@/Ui/Input";
import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { useUser, useUserContext } from "@/auth";
import { useSyncing } from "@/utils/Syncing";
import { apiRequest } from "@/utils/api/apiRequest";
import { sleep } from "@/utils/sleep";
import { useForm } from "@/utils/useForm";

import { WithAnimation } from "../WithAnimation";
import { EnableNotifications } from "./Notifications";

export function AppSettingsPage() {
	return (
		<WithAnimation>
			<div className="flex flex-col gap-2 p-4">
				<EnableNotifications />

				<DeleteAccount />
			</div>
		</WithAnimation>
	);
}

function deleteAccountFormSchema(userEmail: string) {
	return z.object({
		email: z
			.string()
			.email()
			.nonempty()
			.refine((email) => email === userEmail, { message: "emails don't match" }),
	});
}

function DeleteAccount() {
	const { disableSync, enableSync } = useSyncing();
	const { logout } = useUserContext();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [submitButtonStatus, setSubmitButtonStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const user = useUser();

	const deleteAccountMutation = useMutation(() =>
		apiRequest<void>({
			method: "DELETE",
			path: "/users/me",
		})
	);

	const deleteAccountForm = useForm({
		resolver: zodResolver(deleteAccountFormSchema(user.email)),
		defaultValues: { email: "" },
		onSubmit: async () => {
			setSubmitButtonStatus("loading");
			disableSync();

			const [res] = await Promise.allSettled([
				deleteAccountMutation.mutateAsync(),
				sleep(1000),
			]);

			if (res.status === "fulfilled") {
				setSubmitButtonStatus("success");

				enableSync();
				await sleep(1000);
				await logout();

				setSubmitButtonStatus("idle");
			} else {
				setSubmitButtonStatus("error");
				await sleep(1500);
				setSubmitButtonStatus("idle");
			}
		},
	});

	return (
		<>
			<Button onPress={() => setIsModalOpen(true)}>delete account</Button>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<form onSubmit={deleteAccountForm.handleSubmit} className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold leading-none">delete account</h1>

					<p className="text-gray-400">this action cannot be undone.</p>

					<p className="text-gray-400">
						type your email address ({user.email}) to confirm:
					</p>

					<Input
						type="email"
						{...deleteAccountForm.register("email")}
						error={deleteAccountForm.formState.errors.email?.message}
					/>

					<div className="flex gap-2 w-full">
						<Button
							className="w-full p-3"
							onPress={() => setIsModalOpen(false)}
							isSecondary
						>
							cancel
						</Button>

						<Button className="w-full p-3" type="submit">
							{submitButtonStatus === "loading" ? (
								<motion.div
									key="loader"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2, ease: "easeInOut" }}
									className="box-border h-4 w-4 animate-spin-slow rounded-full border-2 border-gray-400 border-r-gray-600"
								/>
							) : submitButtonStatus === "success" ? (
								<Checkmark key="check" />
							) : submitButtonStatus === "error" ? (
								<motion.span
									key="error"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									failed
								</motion.span>
							) : (
								<motion.span
									key="error"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									delete
								</motion.span>
							)}
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
}

function Checkmark() {
	return (
		<div className="relative flex items-center justify-center">
			<svg
				className="h-5 w-5 text-white"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<motion.path
					initial={{ pathLength: 0 }}
					animate={{
						pathLength: 1,
					}}
					transition={{
						duration: 0.5,
						delay: 0.25,
						type: "tween",
						ease: "easeOut",
					}}
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M5 13l4 4L19 7"
				/>
			</svg>
		</div>
	);
}
