import { useState } from "react";

import { createId } from "@tasks/shared";

import { Button2, Button3 } from "@/Ui/Button";
import { Input } from "@/Ui/Input";
import { Label } from "@/Ui/Label";
import { Modal } from "@/Ui/Modal";
import { db } from "@/db/db";
import { useForm } from "@/utils/useForm";

export function NewTag() {
	const [isOpen, setIsOpen] = useState(false);

	const newTagForm = useForm({
		defaultValues: {
			label: "",
		},
		onSubmit: (values) => {
			db.tags.add({
				id: createId(),
				label: values.label,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

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
						<Button3 type="submit" className="p-3">
							Create
						</Button3>
					</div>
				</newTagForm.Form>
			</Modal>
		</>
	);
}
