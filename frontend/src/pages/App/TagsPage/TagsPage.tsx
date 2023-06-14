import { useMutation } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

import { Input } from "@/Ui/Input";
import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { type DbTag, db } from "@/db/db";
import { apiRequest } from "@/utils/api/apiRequest";
import type { ApiTag } from "@/utils/api/types";
import { createId } from "@/utils/createId";
import { useForm } from "@/utils/useForm";

import { WithAnimation } from "../WithAnimation";

export function TagsPage() {
	const dbTags = useLiveQuery(() => db.tags.toArray());

	const [selectedTagId, setSelectedTagId] = useState<string>();
	const selectedTag = dbTags?.find((tag) => tag.id === selectedTagId);

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col gap-2">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="px-4 pt-4 text-2xl font-bold">Tags</h1>
					</div>

					<div className="px-4 pt-4">
						<NewTag />
					</div>
				</div>

				<div className="flex flex-col gap-2 p-4">
					{dbTags?.map((tag) => (
						<div className="rounded-lg bg-gray-950/60 p-4">{tag.label}</div>
					))}
				</div>
			</div>
		</WithAnimation>
	);
}

function NewTag() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const addTagMutation = useMutation((newTag: ApiTag) =>
		apiRequest({
			method: "POST",
			path: "/tags",
			body: newTag,
		})
	);

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
			setIsModalOpen(false);
		},
	});

	return (
		<>
			<Button className="px-4 py-1" onPress={() => setIsModalOpen(true)}>
				New tag
			</Button>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<newTagForm.Form className="flex h-full w-full flex-col justify-between gap-4">
					<h1 className="text-3xl font-bold">Create a tag</h1>

					<div className="flex flex-col gap-2">
						<Input label="Label" {...newTagForm.register("label")} />
					</div>

					<div className="flex w-full gap-2">
						<Button
							onPress={() => setIsModalOpen(false)}
							className="flex-1 p-4"
							isSecondary
						>
							Cancel
						</Button>
						<Button className="flex-1 p-4" type="submit">
							Create
						</Button>
					</div>
				</newTagForm.Form>
			</Modal>
		</>
	);
}
