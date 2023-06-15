import { FocusRing } from "@react-aria/focus";
import { useLink } from "@react-aria/link";
import { motion, useAnimation } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import colors from "tailwindcss/colors";

import { cn } from "@/utils/classNames";

const MotionLink = motion(Link);

export function LinkButton(props: { children: ReactNode; to: string; className?: string }) {
	const ref = useRef<HTMLLinkElement | null>(null);
	const controls = useAnimation();

	const aria = useLink(
		{
			onPressStart: () => {
				controls.stop();
				controls.set({ backgroundColor: colors.neutral[500] });
			},
			onPressEnd: () => {
				controls.start({
					backgroundColor: colors.neutral[600],
					transition: { duration: 0.4 },
				});
			},
			onPress: () => {
				ref.current?.focus();
				controls.start({
					backgroundColor: colors.neutral[600],
					transition: { duration: 0.4 },
				});
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
		},
		ref
	);

	return (
		<FocusRing>
			{/* @ts-expect-error dont know how to fix this */}
			<MotionLink
				{...aria.linkProps}
				to={props.to}
				ref={ref}
				animate={controls}
				transition={{ duration: 0.2 }}
				className={cn(
					"flex cursor-default select-none items-center justify-center gap-2 rounded-xl bg-gray-600 px-4 outline-none outline-2 outline-offset-2 transition-[outline,opacity] duration-200 disabled:opacity-40 disabled:shadow-none",
					props.className
				)}
			>
				{props.children}
			</MotionLink>
		</FocusRing>
	);
}
