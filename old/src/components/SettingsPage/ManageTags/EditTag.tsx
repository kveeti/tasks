import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

import { ColorSelector } from "~components/_shared/CreateTagModal/ColorSelector";
import { Button } from "~ui/Button";
import { Error } from "~ui/Error";
import { Input } from "~ui/Input";
import { Label } from "~ui/Label";
import { Modal, useModal } from "~ui/Modal";
import { RouterOutputs, trpc } from "~utils/trpc";
import { v } from "~validation";

import type { TagColors } from "../../IndexPage/Timer/Tags/tagColors";

type EditTagFormSchema = z.infer<typeof v.me.tags.updateTag.form>;

type Props = {
	tag: RouterOutputs["me"]["tags"]["getAll"][number];
};

export const EditTag = ({ tag }: Props) => {
	const { isModalOpen, closeModal, openModal } = useModal();

	const form = useForm<EditTagFormSchema>({
		resolver: zodResolver(v.me.tags.updateTag.form),
		defaultValues: {
			label: tag.label,
			color: tag.color as TagColors,
		},
	});
	const utils = trpc.useContext();
	const mutation = trpc.me.tags.updateTag.useMutation();

	const onSubmit = async (values: EditTagFormSchema) => {
		try {
			await toast.promise(
				mutation.mutateAsync({
					tagId: tag.id,
					...values,
				}),
				{
					loading: "Updating tag...",
					success: "Updated!",
					error: "Failed to update tag :(",
				}
			);

			utils.me.tags.getAll.invalidate();
			closeModal();
		} catch (err) {
			toast.error(err.message);
			form.setFocus("label");
		}
	};

	const isSubmitting = form.formState.isSubmitting;

	return (
		<>
			<Button onClick={openModal} className="w-full">
				Edit
			</Button>

			<Modal title={`Edit ${tag.label}`} isOpen={isModalOpen} closeModal={closeModal}>
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
						<Button intent="submit" disabled={isSubmitting} type="submit">
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
};
