import { type AriaButtonProps, useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { motion, useAnimation } from "framer-motion";
import { useRef } from "react";
import colors from "tailwindcss/colors";

import { cn } from "@/utils/classNames";

export function Button(props: { className?: string; isSecondary?: boolean } & AriaButtonProps) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();

	const baseColor = props.isSecondary ? colors.neutral[700] : colors.neutral[600];
	const highlightColor = props.isSecondary ? colors.neutral[600] : colors.neutral[500];

	const aria = useButton(
		{
			onPressStart: (e) => {
				props.onPressStart?.(e);
				controls.stop();
				controls.set({ backgroundColor: highlightColor });
			},
			onPressEnd: (e) => {
				props.onPressEnd?.(e);
				controls.start({
					backgroundColor: baseColor,
					transition: { duration: 0.4 },
				});
			},
			onPress: (e) => {
				ref.current?.focus();
				props.onPress?.(e);
				controls.start({
					backgroundColor: baseColor,
					transition: { duration: 0.4 },
				});
			},
			...props,
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
					"flex cursor-default select-none items-center justify-center gap-2 rounded-xl px-4 outline-none outline-2 outline-offset-2 transition-[outline,opacity] duration-200 disabled:opacity-40",
					props.isSecondary ? "bg-gray-700" : "bg-gray-600",
					props.className
				)}
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}
