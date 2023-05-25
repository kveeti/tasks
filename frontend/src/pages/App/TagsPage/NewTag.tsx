import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Button2, Button3 } from "@/Ui/Button";
import { Input } from "@/Ui/Input";
import { Label } from "@/Ui/Label";
import { Modal } from "@/Ui/Modal";
import { type DbTag, db } from "@/db/db";
import { apiRequest } from "@/utils/api/apiRequest";
import type { ApiTag } from "@/utils/api/types";
import { createId } from "@/utils/createId";
import { useForm } from "@/utils/useForm";

export function NewTag() {
	const [isOpen, setIsOpen] = useState(false);

	const addTagMutation = useAddTagMutation();

	const newTagForm = useForm({
		defaultValues: {
			label: "",
		},
		onSubmit: async (values) => {
			const newTag: DbTag = {
				id: createId(),
				label: values.label,
				created_at: new Date(),
				updated_at: new Date(),
			};

			await Promise.all([
				db.tags.add(newTag),
				addTagMutation.mutateAsync({
					...newTag,
					updated_at: newTag.updated_at.toISOString(),
					created_at: newTag.created_at.toISOString(),
				}),
			]);

			newTagForm.reset();
			setIsOpen(false);
		},
	});

	return (
		<>
			<Button2 className="w-max px-2.5 py-1 text-sm" onPress={() => setIsOpen(true)}>
				New tag
			</Button2>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<Modal.Title className="mb-6 text-2xl font-bold">New tag</Modal.Title>

				<newTagForm.Form className="flex flex-col gap-6">
					<div className="grid grid-cols-[max-content,1fr] gap-6">
						<Label className="flex items-center" htmlFor="label">
							Label
						</Label>
						<Input id="label" {...newTagForm.register("label")} />
					</div>

					<div className="flex gap-2">
						<Button2 onPress={() => setIsOpen(false)}>Cancel</Button2>
						<Button3
							type="submit"
							className="p-3"
							isDisabled={newTagForm.formState.isSubmitting}
						>
							Create
						</Button3>
					</div>
				</newTagForm.Form>
			</Modal>
		</>
	);
}

function useAddTagMutation() {
	return useMutation((newTag: ApiTag) =>
		apiRequest({
			method: "POST",
			path: "/tags",
			body: newTag,
		})
	);
}
