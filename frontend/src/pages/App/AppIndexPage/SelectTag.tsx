import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import type { AriaButtonProps } from "@react-types/button";
import { motion, useAnimation } from "framer-motion";
import { type ComponentProps, useRef, useState } from "react";
import colors from "tailwindcss/colors";

import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { cn } from "@/utils/classNames";
import { sleep } from "@/utils/sleep";

import { useTimerContext } from "../TimerContext";

export function SelectTag() {
	const { selectedTag, setSelectedTagId, dbTags } = useTimerContext();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button className="px-4 py-2" onPress={() => setIsOpen(true)}>
				{selectedTag ? (
					<div className="flex items-center gap-2">
						<div
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: selectedTag.color }}
						/>

						<span>{selectedTag.label}</span>
					</div>
				) : (
					"select a tag"
				)}
			</Button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold">select a tag</h1>

					<div className="flex w-full flex-col gap-2">
						{dbTags?.map((tag) => (
							<Tag
								key={tag.id}
								onPress={() => {
									setSelectedTagId(tag.id);
									setIsOpen(false);
								}}
							>
								<div
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: tag.color }}
								/>

								{tag.label}
							</Tag>
						))}
					</div>
				</div>
			</Modal>
		</>
	);
}

function Tag(props: ComponentProps<"button"> & AriaButtonProps) {
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

				await sleep(200);

				props.onPress?.(e);
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
		},
		ref
	);

	return (
		<FocusRing focusRingClass="outline-gray-300">
			{/* @ts-expect-error dont know how to fix this */}
			<motion.button
				{...aria.buttonProps}
				ref={ref}
				animate={controls}
				className={cn(
					"flex w-full cursor-default items-center gap-4 rounded-xl bg-gray-950/50 p-4 outline-none outline-2 outline-offset-2",
					props.className
				)}
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}
