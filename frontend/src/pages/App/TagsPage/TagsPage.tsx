import { zodResolver } from "@hookform/resolvers/zod";
import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import type { AriaButtonProps } from "@react-types/button";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Plus } from "lucide-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import colors from "tailwindcss/colors";
import { z } from "zod";

import { Error } from "@/Ui/Error";
import { Input } from "@/Ui/Input";
import { Label } from "@/Ui/Label";
import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { type DbTag, db } from "@/db/db";
import { cn } from "@/utils/classNames";
import { createId } from "@/utils/createId";
import { useForm } from "@/utils/useForm";

import { WithAnimation } from "../WithAnimation";
import { ColorSelector, tagColors, zodTagColors } from "./ColorSelector";

export function TagsPage() {
	const dbTags = useLiveQuery(() => db.tags.filter((t) => !t.deleted_at).toArray())?.sort(
		(a, b) => +b.created_at - +a.created_at
	);
	const [tagInEdit, setTagInEdit] = useState<DbTag | null>(null);
	const [createdTag, setCreatedTag] = useState<DbTag | null>(null);

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col gap-2">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="px-4 pt-4 text-2xl font-bold">Tags</h1>
					</div>

					<div className="px-4 pt-4">
						<NewTag setCreatedTag={setCreatedTag} />
					</div>
				</div>

				<div className="flex flex-col gap-2 overflow-auto p-4">
					<AnimatePresence initial={false}>
						{dbTags?.map((tag) => (
							<motion.div
								key={tag.id}
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
							>
								<Tag
									key={tag.id}
									createdTag={createdTag?.id === tag.id}
									onPress={() => setTagInEdit(tag)}
								>
									{tag.label}
								</Tag>
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				{tagInEdit && (
					<EditTag tagInEdit={tagInEdit} setTagInEdit={setTagInEdit} dbTags={dbTags} />
				)}
			</div>
		</WithAnimation>
	);
}

const newTagFormSchema = z.object({
	label: z.string().nonempty(),
	color: zodTagColors,
});

function NewTag(props: { setCreatedTag: (tag: DbTag) => void }) {
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
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			};

			await db.tags.add(newTag);

			newTagForm.reset();
			setIsModalOpen(false);
			props.setCreatedTag(newTag);
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
					<h1 className="text-2xl font-bold">create a tag</h1>

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

function EditTag(props: {
	tagInEdit: DbTag;
	setTagInEdit: (tag: DbTag | null) => void;
	dbTags?: DbTag[];
}) {
	const editTagForm = useForm({
		resolver: zodResolver(
			z.object({
				label: z
					.string()
					.min(2, { message: "too short! must be at least 2 chars" })
					.refine(
						(label) =>
							!props.dbTags?.some(
								(tag) => tag.label === label && tag.id !== props.tagInEdit.id
							),
						"label in use! two tags can't have the same label"
					),
			})
		),
		defaultValues: { label: props.tagInEdit.label },
		onSubmit: async (values) => {
			const newTag: DbTag = {
				...props.tagInEdit,
				label: values.label,
				updated_at: new Date(),
			};

			await db.tags.put(newTag);
			editTagForm.reset();
			props.setTagInEdit(null);
		},
	});

	return (
		<Modal isOpen={true} onClose={() => props.setTagInEdit(null)}>
			<form
				onSubmit={editTagForm.handleSubmit}
				className="flex h-full w-full flex-col justify-between gap-4"
			>
				<h1 className="text-2xl font-bold">edit tag</h1>

				<Input
					label="label"
					error={editTagForm.formState.errors.label?.message}
					{...editTagForm.register("label")}
				/>

				<div className="flex w-full gap-2">
					<Button
						onPress={() => props.setTagInEdit(null)}
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

function Tag(props: ComponentProps<"button"> & AriaButtonProps & { createdTag: boolean }) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();

	const aria = useButton(
		{
			...props,
			onPress: async (e) => {
				controls.set({ backgroundColor: colors.neutral[800] });

				controls.start({
					backgroundColor: "rgb(10 10 10 / 0.5)",
					transition: { duration: 0.4 },
				});

				props.onPress?.(e);
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
		},
		ref
	);

	useEffect(() => {
		if (!props.createdTag) return;

		controls.set({ backgroundColor: colors.neutral[700] });

		controls.start({
			backgroundColor: "rgb(10 10 10 / 0.5)",
			transition: { duration: 0.5 },
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<FocusRing focusRingClass="outline-gray-300">
			{/* @ts-expect-error dont know how to fix this */}
			<motion.button
				{...aria.buttonProps}
				ref={ref}
				animate={controls}
				className={cn(
					"w-full cursor-default rounded-xl bg-gray-950/50 p-4 outline-none outline-2 outline-offset-2",
					props.className
				)}
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}
