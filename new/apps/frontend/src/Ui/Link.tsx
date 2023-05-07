import { FocusRing } from "@react-aria/focus";
import { type AriaLinkOptions, useLink } from "@react-aria/link";
import { motion, useAnimation } from "framer-motion";
import { type ReactNode, useRef } from "react";

import { colors } from "./_colors";

export function Link(
	props: AriaLinkOptions & { children: ReactNode; href: string; target?: string }
) {
	const ref = useRef<HTMLAnchorElement | null>(null);
	const controls = useAnimation();

	const aria = useLink(
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
			<motion.a
				{...aria.linkProps}
				ref={ref}
				animate={controls}
				href={props.href}
				target={props.target}
				className="select-none rounded-md bg-primary-700 px-2.5 py-1.5 outline-none focus:outline-none"
			>
				{props.children}
			</motion.a>
		</FocusRing>
	);
}
