import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "~ui/Button";
import { Input } from "~ui/Input";
import { Modal, useModal } from "~ui/Modal";
import { RouterOutputs, trpc } from "~utils/trpc";
import { v } from "~validation";

type EditAccountFormSchema = z.infer<typeof v.me.updateMe.form>;

type Props = { user: RouterOutputs["me"]["getMe"] };

export const EditAccount = ({ user }: Props) => {
	const { closeModal, openModal, isModalOpen } = useModal();

	const utils = trpc.useContext();
	const mutation = trpc.me.updateMe.useMutation({
		onSuccess: () => utils.me.getMe.invalidate(),
	});
	const form = useForm({
		resolver: zodResolver(v.me.updateMe.form),
		defaultValues: { username: user.username ?? "" },
	});
	const isSubmitting = form.formState.isSubmitting;
	const formErrors = form.formState.errors;

	const onSubmit = async (values: EditAccountFormSchema) => {
		try {
			await toast.promise(mutation.mutateAsync(values), {
				loading: "Saving changes...",
				success: "Saved!",
				error: "Failed to save changes :(",
			});

			closeModal();
		} catch (err) {
			form.setFocus("username");
		}
	};

	return (
		<>
			<Button onClick={openModal}>Edit account</Button>

			<Modal title="Edit user" isOpen={isModalOpen} closeModal={closeModal}>
				<form
					className="mb-4 flex flex-col gap-4 px-4 pt-2"
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
				>
					<Input
						label="Username"
						type="text"
						autoComplete="username"
						required
						{...form.register("username")}
						error={formErrors.username?.message}
					/>

					<div className="grid grid-cols-2 gap-2">
						<Button onClick={closeModal}>Cancel</Button>
						<Button disabled={isSubmitting} type="submit" intent="submit">
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
};

export const SkeletonEditAccount = () => {
	return <Button intent="skeleton">&nbsp;</Button>;
};
