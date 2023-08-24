import { zodResolver } from "@hookform/resolvers/zod";
import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { useAnimate } from "framer-motion";
import { Trash } from "lucide-react";
import { useState } from "react";
import colors from "tailwindcss/colors";
import { z } from "zod";

import { type DbTag, addNotSynced, db } from "@/db/db";
import { ColorSelector, type TagColors, zodTagColors } from "@/pages/App/AppTagsPage/ColorSelector";
import { useForm } from "@/utils/useForm";

import { Error } from "../Error";
import { Input } from "../Input";
import { Label } from "../Label";
import { Modal } from "../Modal";
import { Button } from "../NewButton";

export function Tag(props: { tag: DbTag; onPress?: () => void }) {
	const [ref, animate] = useAnimate();
	const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);

	const aria = useButton(
		{
			...props,
			onPressStart: async () => {
				animate(ref.current, { backgroundColor: colors.neutral[800] }, { duration: 0 });
			},
			onPressEnd: async () => {
				animate(ref.current, {
					backgroundColor: "rgb(10 10 10 / 0.5)",
					transition: { duration: 0.4 },
				});
			},
			onPress: async () => {
				animate(ref.current, {
					backgroundColor: "rgb(10 10 10 / 0.5)",
					transition: { duration: 0.4 },
				});

				props.onPress?.();
				setIsEditTagModalOpen(true);
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
		},
		ref
	);

	return (
		<>
			<FocusRing focusRingClass="outline-gray-300">
				<button
					{...aria.buttonProps}
					ref={ref}
					className="flex w-full cursor-default rounded-xl items-center justify-between gap-4 mb-2 p-4 bg-gray-950/50 outline-none outline-2 outline-offset-2"
				>
					<div className="flex items-center gap-4">
						<div
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: props.tag.color }}
						/>
						{props.tag.label}
					</div>

					<DeleteTag tag={props.tag} />
				</button>
			</FocusRing>

			<EditTag
				tag={props.tag}
				isOpen={isEditTagModalOpen}
				setIsOpen={setIsEditTagModalOpen}
			/>
		</>
	);
}

function EditTag(props: {
	tag: DbTag;
	dbTags?: DbTag[];
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}) {
	const editTagFormSchema = z.object({
		label: z
			.string()
			.min(2, { message: "too short! must be at least 2 chars" })
			.refine(
				(label) =>
					!props.dbTags?.some((tag) => tag.label === label && tag.id !== props.tag.id),
				"label in use! two tags can't have the same label"
			),
		color: zodTagColors,
	});

	const editTagForm = useForm<z.infer<typeof editTagFormSchema>>({
		resolver: zodResolver(editTagFormSchema),
		defaultValues: { label: props.tag.label, color: props.tag.color as TagColors },
		onSubmit: async (values) => {
			const newTag: DbTag = {
				...props.tag,
				label: values.label,
				color: values.color,
				updated_at: new Date(),
			};

			await Promise.all([db.tags.put(newTag), addNotSynced(newTag.id, "tag")]);
			editTagForm.reset();
		},
	});

	return (
		<Modal isOpen={props.isOpen} onClose={() => props.setIsOpen(false)}>
			<form
				onSubmit={editTagForm.handleSubmit}
				className="flex h-full w-full flex-col justify-between gap-4"
			>
				<h1 className="text-2xl font-bold">edit tag</h1>

				<Input
					label="label"
					required
					error={editTagForm.formState.errors.label?.message}
					{...editTagForm.register("label")}
				/>

				<div className="flex flex-col">
					<Label required>color</Label>

					<ColorSelector form={editTagForm} />

					<Error message={editTagForm.formState.errors.color?.message} />
				</div>

				<div className="flex w-full gap-2">
					<Button
						onPress={() => props.setIsOpen(false)}
						className="flex-1 p-4"
						isSecondary
					>
						cancel
					</Button>
					<Button className="flex-1 p-4" type="submit">
						save
					</Button>
				</div>
			</form>
		</Modal>
	);
}

function DeleteTag(props: { tag: DbTag }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<Button onPress={() => setIsModalOpen(true)} className="rounded-full p-2">
				<Trash className="h-4 w-4" />
			</Button>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<form className="flex h-full w-full flex-col justify-between gap-4">
					<h1 className="text-2xl font-bold">delete tag</h1>

					<div className="flex w-full cursor-default rounded-xl items-center gap-4 p-4 bg-gray-950/50 outline-none outline-2 outline-offset-2">
						<div
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: props.tag.color }}
						/>

						{props.tag.label}
					</div>

					<div className="flex w-full gap-2">
						<Button
							onPress={() => setIsModalOpen(false)}
							className="flex-1 p-4"
							isSecondary
						>
							cancel
						</Button>
						<Button
							className="flex-1 p-4"
							onPress={() => {
								db.tags.delete(props.tag.id);
								addNotSynced(props.tag.id, "tag");
								setIsModalOpen(false);
							}}
						>
							delete
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
}
