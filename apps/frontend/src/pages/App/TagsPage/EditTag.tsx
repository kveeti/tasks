import { Pencil2Icon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Button2, Button3 } from "@/Ui/Button";
import { Input } from "@/Ui/Input";
import { Label } from "@/Ui/Label";
import { Modal } from "@/Ui/Modal";
import { type DbTag, db } from "@/db/db";
import { useForm } from "@/utils/useForm";

export function EditTag(props: { tag: DbTag }) {
	const [isOpen, setIsOpen] = useState(false);

	const editTagForm = useForm({
		defaultValues: { label: props.tag.label },
		onSubmit: (values) => {
			db.tags.update(props.tag.id, {
				label: values.label,
				updatedAt: new Date(),
			});
		},
	});

	return (
		<>
			<Button2 className="w-max p-2 text-sm" onPress={() => setIsOpen(true)}>
				<Pencil2Icon className="h-[1.1rem] w-[1.1rem]" />
			</Button2>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<Modal.Title className="mb-6 text-2xl font-bold">Edit tag</Modal.Title>

				<editTagForm.Form className="flex flex-col gap-6">
					<div className="grid grid-cols-[max-content,1fr] gap-6">
						<Label className="flex items-center" htmlFor="label">
							Label
						</Label>
						<Input id="label" {...editTagForm.register("label")} />
					</div>

					<div className="flex gap-2">
						<Button2 onPress={() => setIsOpen(false)}>Cancel</Button2>
						<Button3 type="submit" className="p-3">
							Save
						</Button3>
					</div>
				</editTagForm.Form>
			</Modal>
		</>
	);
}
