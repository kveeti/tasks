import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

import { Button } from "~ui/Button";
import { Error } from "~ui/Error";
import { Input } from "~ui/Input";
import { Label } from "~ui/Label";
import { Modal, useModal } from "~ui/Modal";
import { trpc } from "~utils/trpc";
import { v } from "~validation";

import { tagColors } from "../tagColors";
import { ColorSelector } from "./ColorSelector";

type CreateTagFormSchema = z.infer<typeof v.me.tags.createTag.form>;

export const CreateTag = () => {
	const { isModalOpen, closeModal, openModal } = useModal();

	const form = useForm<CreateTagFormSchema>({
		resolver: zodResolver(v.me.tags.createTag.form),
		defaultValues: { color: tagColors.at(2) },
	});
	const utils = trpc.useContext();
	const mutation = trpc.me.tags.createTag.useMutation({
		onSuccess: () => utils.me.getMe.invalidate(),
	});

	const onSubmit = async (values: CreateTagFormSchema) => {
		try {
			await toast.promise(mutation.mutateAsync(values), {
				loading: "Creating tag...",
				success: "Tag created!",
				error: "Failed to create tag :(",
			});

			form.reset();
			closeModal();
		} catch (_err) {
			form.setFocus("label");
		}
	};

	const isSubmitting = form.formState.isSubmitting;

	return (
		<>
			<Button intent="submit" onClick={openModal}>
				Create a tag
			</Button>

			<Modal title="Create a tag" isOpen={isModalOpen} closeModal={closeModal}>
				<form
					className="mb-4 flex flex-col gap-4 px-4 pt-2"
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
				>
					<Input
						label="Label"
						error={form.formState.errors.label?.message}
						required
						{...form.register("label")}
					/>

					<div className="flex flex-col">
						<Label required>Color</Label>

						<ColorSelector form={form} />

						<Error message={form.formState.errors.color?.message} />
					</div>

					<div className="grid grid-cols-2 gap-2 pt-2">
						<Button onClick={closeModal}>Cancel</Button>
						<Button disabled={isSubmitting} type="submit" intent="submit">
							{isSubmitting ? "Creating..." : "Create"}
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
};
