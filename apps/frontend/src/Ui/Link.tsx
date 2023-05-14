import { FocusRing } from "@react-aria/focus";
import { type AriaLinkOptions, useLink } from "@react-aria/link";
import { motion, useAnimation } from "framer-motion";
import { type ReactNode, useRef } from "react";
import colors from "tailwindcss/colors";
import { cn } from "../utils/classNames";

import { Link as RRDLink } from "react-router-dom";

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
					"relative w-full cursor-default border-2 border-b-4 border-transparent outline-none rounded-xl",
					props.className
				)}
			>
				<motion.span
					tabIndex={-1}
					aria-hidden="true"
					animate={anotherControls}
					className="border-gray-700 border-2 -bottom-0.5 absolute -z-10 -inset-[2px] rounded-xl"
					style={{
						boxShadow: `0 2px 0 ${colors.gray[700]}`,
					}}
				/>
				{props.children}
			</MotionLink>
		</FocusRing>
	);
}
