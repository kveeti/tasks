import { type AriaButtonProps, useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { motion, useAnimation } from "framer-motion";
import { useRef } from "react";

import { colors } from "./_colors";

export function Button(props: AriaButtonProps) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();

	const aria = useButton(
		{
			onPressStart: (e) => {
				props.onPressStart?.(e);
				controls.stop();
				controls.set({ background: colors.primary[900] });
			},
			onPressEnd: (e) => {
				props.onPressEnd?.(e);
				controls.start({
					background: colors.primary[700],
					transition: { duration: 0.4 },
				});
			},
			onPress: (e) => {
				ref.current?.focus();
				props.onPress?.(e);
				controls.start({
					background: [null, colors.primary[700]],
					transition: { duration: 0.4 },
				});
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
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
				className="select-none rounded-md bg-primary-700 px-2.5 py-1.5 outline-none focus:outline-none"
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}
