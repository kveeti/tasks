import { type AriaButtonProps, useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { motion, useAnimation } from "framer-motion";
import { useRef, type ComponentProps, type ReactNode } from "react";
import colors from "tailwindcss/colors";

import { cn } from "../classNames";

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
				ref.current?.focus();
				props.onPress?.(e);
				controls.start({
					// background: [null, colors.primary[900]],
					// border: [null, `1px solid ${colors.primary[700]}`],
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
				className={cn(
					"select-none rounded-md cursor-default bg-gray-800 border border-gray-600 px-2.5 py-1.5 outline-none focus:outline-none",
					props.className
				)}
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}

export function Button2(props: { children: ReactNode; className?: string }) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();
	const anotherControls = useAnimation();

	const aria = useButton(
		{
			onPressStart: (e) => {
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
			<motion.button
				{...aria.buttonProps}
				ref={ref}
				animate={controls}
				className={cn(
					"relative grow w-full cursor-default border-2 border-b-4 border-transparent outline-none rounded-xl",
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
			</motion.button>
		</FocusRing>
	);
}

export function Button3(props: { children: ReactNode; className?: string }) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();
	const anotherControls = useAnimation();

	const aria = useButton(
		{
			onPressStart: (e) => {
				controls.stop();
				controls.set({
					y: 2,
					transition: { duration: 0.3, type: "spring" },
				});

				// this will log a warning in the console but it doesn't
				// work any other way.
				anotherControls.start({
					boxShadow: "none",
				});
			},
			onPressEnd: (e) => {
				controls.start({
					y: 0,
					transition: { duration: 0.3, type: "spring" },
				});

				anotherControls.start({
					boxShadow: `0 2px 0 ${colors.blue[900]}`,
					transition: { duration: 0.3, type: "spring" },
				});
			},
			onPress: (e) => {
				ref.current?.focus();
				controls.start({
					y: 0,
					transition: { duration: 0.3, type: "spring" },
				});

				anotherControls.start({
					boxShadow: `0 2px 0 ${colors.blue[900]}`,
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
			<motion.button
				{...aria.buttonProps}
				ref={ref}
				animate={controls}
				className={cn(
					"relative grow w-full cursor-default border-b-2 border-b-transparent outline-none rounded-xl",
					props.className
				)}
			>
				<motion.span
					tabIndex={-1}
					aria-hidden="true"
					animate={anotherControls}
					className="bg-blue-500 inset-0 absolute -z-10 rounded-xl"
					style={{
						boxShadow: `0 2px 0 ${colors.blue[900]}`,
					}}
				/>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}
