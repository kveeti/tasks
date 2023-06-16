import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import type { AriaButtonProps } from "@react-types/button";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import colors from "tailwindcss/colors";

import { Input } from "@/Ui/Input";
import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { type DbTag, db } from "@/db/db";
import { cn } from "@/utils/classNames";
import { createId } from "@/utils/createId";
import { sleep } from "@/utils/sleep";
import { useForm } from "@/utils/useForm";

import { WithAnimation } from "../WithAnimation";

export function TagsPage() {
	const dbTags = useLiveQuery(() => db.tags.toArray());
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

				<div className="flex flex-col gap-2 p-4">
					{dbTags?.map((tag) => (
						<Tag
							createdTag={createdTag?.id === tag.id}
							onPress={() => setTagInEdit(tag)}
						>
							{tag.label}
						</Tag>
					))}
				</div>

				{tagInEdit && <EditTag tagInEdit={tagInEdit} setTagInEdit={setTagInEdit} />}
			</div>
		</WithAnimation>
	);
}

function NewTag(props: { setCreatedTag: (tag: DbTag) => void }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

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
			<Button className="px-4 py-1" onPress={() => setIsModalOpen(true)}>
				new tag
			</Button>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<newTagForm.Form className="flex h-full w-full flex-col justify-between gap-4">
					<h1 className="text-3xl font-bold">create a tag</h1>

					<div className="flex flex-col gap-2">
						<Input label="label" {...newTagForm.register("label")} />
					</div>

					<div className="flex w-full gap-2">
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
				</newTagForm.Form>
			</Modal>
		</>
	);
}

function EditTag(props: { tagInEdit: DbTag; setTagInEdit: (tag: DbTag | null) => void }) {
	const editTagForm = useForm({
		defaultValues: {
			label: props.tagInEdit.label,
		},
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
			<editTagForm.Form className="flex h-full w-full flex-col justify-between gap-4">
				<h1 className="text-3xl font-bold">edit tag</h1>

				<div className="flex flex-col gap-2">
					<Input label="label" {...editTagForm.register("label")} />
				</div>

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
			</editTagForm.Form>
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
					transition: { duration: 0.3 },
				});

				await sleep(100);

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
