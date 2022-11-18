import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "~ui/Button";
import { Modal, useModal } from "~ui/Modal";
import { sleep } from "~utils/sleep";
import { trpc } from "~utils/trpc";

export const DeleteAccount = () => {
	const { closeModal, openModal, isModalOpen } = useModal();

	const mutation = trpc.me.deleteMe.useMutation();

	const form = useForm();
	const isSubmitting = form.formState.isSubmitting;

	const onSubmit = async () => {
		await toast.promise(mutation.mutateAsync(), {
			loading: "Deleting account...",
			success: "Account deleted! Bye bye... :(",
			error: "Failed to delete account!",
		});

		closeModal();
		await sleep(1000);

		signOut();
	};

	return (
		<>
			<Button onClick={openModal}>Delete account</Button>

			<Modal title="Delete account" isOpen={isModalOpen} closeModal={closeModal}>
				<p className="px-4 pt-2 pb-4">Are you sure you want to delete your account?</p>

				<form
					className="mb-4 flex flex-col gap-4 px-4"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="grid grid-cols-2 gap-2">
						<Button onClick={closeModal}>Cancel</Button>
						<Button disabled={isSubmitting} type="submit" intent="submit">
							{isSubmitting ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
};

export const SkeletonDeleteAccount = () => {
	return <Button intent="skeleton">&nbsp;</Button>;
};
