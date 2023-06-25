import { FocusRing } from "@react-aria/focus";
import { type AriaLinkOptions, useLink } from "@react-aria/link";
import { motion, useAnimation } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { Link as RRDLink } from "react-router-dom";
import colors from "tailwindcss/colors";

import { cn } from "../utils/classNames";

const MotionLink = motion(RRDLink);

export function Link(
	props: AriaLinkOptions & {
		children: ReactNode;
		href: string;
		target?: string;
		className?: string;
	}
) {
	const ref = useRef<HTMLAnchorElement | null>(null);
	const controls = useAnimation();
	const anotherControls = useAnimation();

	const aria = useLink(
		{
			onPressStart: (e) => {
				props.onPressStart?.(e);
				controls.stop();
				controls.set({
					y: 2,
					transition: { duration: 0.3, type: "spring" },
				});

				anotherControls.start({
					boxShadow: "none",
					transition: { duration: 0.3, type: "spring" },
				});
			},
			onPressEnd: (e) => {
				props.onPressEnd?.(e);
				controls.start({
					y: 0,
					transition: { duration: 0.3, type: "spring" },
				});

				anotherControls.start({
					boxShadow: `0 2px 0 ${colors.gray[700]}`,
					transition: { duration: 0.3, type: "spring" },
				});
			},
			onPress: (e) => {
				props.onPress?.(e);
				ref.current?.focus();
				controls.start({
					y: 0,
					transition: { duration: 0.3, type: "spring" },
				});

				anotherControls.start({
					boxShadow: `0 2px 0 ${colors.gray[700]}`,
					transition: { duration: 0.3, type: "spring" },
				});
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
		},
		ref
	);

	return (
		<FocusRing focusRingClass="shadow-outline">
			{/* @ts-expect-error dont know how to fix this */}
			<MotionLink
				{...aria.linkProps}
				to={props.href}
				ref={ref}
				animate={controls}
				className={cn(
					"relative w-full cursor-default rounded-xl border-2 border-b-4 border-transparent text-center outline-none",
					props.className
				)}
			>
				<motion.span
					tabIndex={-1}
					aria-hidden="true"
					animate={anotherControls}
					className="absolute -inset-[2px] -bottom-0.5 -z-10 rounded-xl border-2 border-gray-700"
					style={{
						boxShadow: `0 2px 0 ${colors.gray[700]}`,
					}}
				/>
				{props.children}
			</MotionLink>
		</FocusRing>
	);
}
