import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Error } from "@/Ui/Error";
import { Input } from "@/Ui/Input";
import { Label } from "@/Ui/Label";
import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { Tag } from "@/Ui/shared/Tag";
import { type DbTag, db } from "@/db/db";
import { useDbTags } from "@/db/useCommonDb";
import { tryPutTags } from "@/utils/api/tryPost";
import { createId } from "@/utils/createId";
import { useForm } from "@/utils/useForm";

import { WithAnimation } from "../WithAnimation";
import { ColorSelector, tagColors, zodTagColors } from "./ColorSelector";

export function AppTagsPage() {
	const dbTags = useDbTags([]);

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col gap-2">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="px-4 pt-4 text-2xl font-bold">tags</h1>
					</div>

					<div className="px-4 pt-4">
						<NewTag />
					</div>
				</div>

				<div className="overflow-auto">
					<div className="flex flex-col p-4">
						{!dbTags ? (
							<div className="flex h-full flex-col items-center justify-center">
								<h2 className="w-full rounded-xl bg-gray-950/50 p-4 text-center outline-none outline-2 outline-offset-2">
									loading...
								</h2>
							</div>
						) : !dbTags.length ? (
							<div className="flex h-full flex-col items-center justify-center">
								<h2 className="w-full rounded-xl bg-gray-950/50 p-4 text-center outline-none outline-2 outline-offset-2">
									no tags
								</h2>
							</div>
						) : (
							<AnimatePresence initial={false}>
								{dbTags?.map((tag) => (
									<motion.div
										key={tag.id}
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
									>
										<motion.div
											initial={{ backgroundColor: "rgba(210, 210, 210, 1)" }}
											animate={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
											transition={{ duration: 1.2 }}
											className="rounded-xl"
										>
											<Tag tag={tag} />
										</motion.div>
									</motion.div>
								))}
							</AnimatePresence>
						)}
					</div>
				</div>
			</div>
		</WithAnimation>
	);
}

const newTagFormSchema = z.object({
	label: z.string().nonempty(),
	color: zodTagColors,
});

function NewTag() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const newTagForm = useForm<z.infer<typeof newTagFormSchema>>({
		resolver: zodResolver(newTagFormSchema),
		defaultValues: {
			label: "",
			color: tagColors.at(2),
		},
		onSubmit: async (values) => {
			const newTag: DbTag = {
				id: createId(),
				label: values.label,
				color: values.color,
				was_last_used: false,
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			};

			await Promise.all([db.tags.add(newTag), tryPutTags([newTag])]);

			newTagForm.reset();
			setIsModalOpen(false);
		},
	});

	useEffect(() => {
		(async () => {
			const createTagParam = new URLSearchParams(window.location.search).get("create_tag");

			if (createTagParam) {
				setIsModalOpen(true);
				window.history.replaceState({}, "", window.location.pathname);
			}
		})();
	}, []);

	return (
		<>
			<Button className="rounded-full p-2" onPress={() => setIsModalOpen(true)}>
				<Plus className="h-4 w-4" />
			</Button>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<form
					onSubmit={newTagForm.handleSubmit}
					className="flex h-full w-full flex-col justify-between gap-4"
				>
					<h1 className="text-2xl font-bold">new tag</h1>

					<Input label="label" required {...newTagForm.register("label")} />

					<div className="flex flex-col">
						<Label required>color</Label>

						<ColorSelector form={newTagForm} />

						<Error message={newTagForm.formState.errors.color?.message} />
					</div>

					<div className="flex w-full gap-2 pt-2">
						<Button
							onPress={() => setIsModalOpen(false)}
							className="flex-1 p-4"
							isSecondary
						>
							cancel
						</Button>
						<Button className="flex-1 p-4" type="submit">
							create
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
}
