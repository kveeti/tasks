import { useButton } from "@react-aria/button";
import { motion, useAnimation } from "framer-motion";
import { useRef, useState } from "react";
import colors from "tailwindcss/colors";

import { Input } from "@/Ui/Input";
import { Label } from "@/Ui/Label";
import { Modal } from "@/Ui/Modal";
import { type DbTag, db } from "@/db/db";
import { useForm } from "@/utils/useForm";

export function Tag(props: { tag: DbTag & { taskAmount?: number } }) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();

	const [isEditOpen, setIsEditOpen] = useState(false);

	const editTagForm = useForm({
		defaultValues: { label: props.tag.label },
		onSubmit: (values) => {
			db.tags.update(props.tag.id, {
				label: values.label,
			});
		},
	});

	editTagForm.watch(() => {
		editTagForm.handleSubmit();
	});

	const aria = useButton(
		{
			onPressStart: () => {
				controls.stop();
				controls.set({
					background: colors.gray[900],
				});
			},
			onPressEnd: () => {
				controls.start({
					background: colors.gray[950],
					transition: { duration: 0.3 },
				});
			},
			onPress: () => {
				ref.current?.focus();
				controls.start({
					background: [null, colors.gray[950]],
					transition: { duration: 0.3 },
				});
				setIsEditOpen(true);
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
			...props,
		},
		ref
	);

	return (
		<>
			{/* @ts-expect-error dont know how to fix this */}
			<motion.button
				{...aria.buttonProps}
				ref={ref}
				animate={controls}
				className="flex cursor-default gap-2 border-b-2 border-gray-800 bg-gray-950 px-3 py-2 outline-none"
			>
				<div className="flex flex-col items-start gap-2">
					<span className="font-bold">{props.tag.label}</span>
					<span className="text-sm">
						{props.tag.taskAmount} task{`${props.tag.taskAmount === 1 ? "" : "s"}`}
					</span>
				</div>
			</motion.button>

			<Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
				<Modal.Title className="mb-6 text-2xl font-bold">Edit tag</Modal.Title>

				<div className="flex flex-col gap-6">
					<div className="grid grid-cols-[max-content,1fr] gap-6">
						<Label className="flex items-center" htmlFor="label">
							Label
						</Label>
						<Input id="label" {...editTagForm.register("label")} />
					</div>
				</div>
			</Modal>
		</>
	);
}
