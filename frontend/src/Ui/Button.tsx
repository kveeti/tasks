import { type AriaButtonProps, useButton } from "@react-aria/button";
import { FocusRing, useFocusRing } from "@react-aria/focus";
import { useHover } from "@react-aria/interactions";
import { mergeProps, mergeRefs } from "@react-aria/utils";
import { motion, useAnimation } from "framer-motion";
import { type ComponentProps, type HTMLAttributes, forwardRef, useRef } from "react";

import { cn } from "../utils/classNames";

export const Button2 = forwardRef<HTMLButtonElement, AriaButtonProps & HTMLAttributes<"button">>(
	(props, forwardedRef) => {
		const { className, children, ...restProps } = props;
		const ref = useRef<HTMLButtonElement | null>(null);
		const { buttonProps, isPressed } = useButton(restProps, ref);
		const { hoverProps, isHovered } = useHover(restProps);
		const { focusProps, isFocusVisible, isFocused } = useFocusRing(restProps);

		return (
			<button
				ref={mergeRefs(ref, forwardedRef)}
				{...mergeProps(buttonProps, hoverProps, focusProps)}
				className={cn(
					"cursor-default select-none rounded-md border border-gray-600 bg-gray-800 px-2.5 py-1.5 outline-none focus:outline-none",
					className
				)}
			>
				{children}
			</button>
		);
	}
);

export function Button(props: ComponentProps<"button"> & AriaButtonProps) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();

	const aria = useButton(
		{
			onPressStart: (e) => {
				props.onPressStart?.(e);
				controls.stop();
				controls.set({
					// background: colors.primary[700],
					// border: `1px solid ${colors.primary[600]}`,
				});
			},
			onPressEnd: (e) => {
				props.onPressEnd?.(e);
				controls.start({
					// background: colors.primary[700],
					// border: `1px solid ${colors.primary[600]}`,
					transition: { duration: 0.4 },
				});
			},
			onPress: (e) => {
				props.onPress?.(e);
				controls.start({
					// background: [null, colors.primary[900]],
					// border: [null, `1px solid ${colors.primary[700]}`],
					transition: { duration: 0.4 },
				});
			},
			...props,
		},
		ref
	);

	return (
		<FocusRing focusRingClass="shadow-outline">
			{/* @ts-expect-error dont know how to fix this */}
			<motion.button
				{...aria.buttonProps}
				ref={ref}
				animate={controls}
				className={cn(
					"cursor-default select-none rounded-md border border-gray-600 bg-gray-800 px-2.5 py-1.5 outline-none focus:outline-none",
					props.className
				)}
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}
