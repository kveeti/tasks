import { AriaButtonProps, useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { useFocusableRef } from "@react-spectrum/utils";
import type { FocusableRef } from "@react-types/shared";
import { motion, useAnimation } from "framer-motion";
import { forwardRef } from "react";

import { classNames } from "~utils/classNames";
import { ColorLevel, colors } from "~utils/colors";

import { NonBreakingSpace } from "./NonBreakingSpace";

const getColors = (intent: "primary" | "submit" = "primary") => {
	const primaryBg = 800;
	const primaryBorder = 600;

	const submitBg = primaryBg - 200;
	const submitBorder = primaryBorder - 100;

	const bg = (intent === "primary" ? primaryBg : submitBg) as ColorLevel;
	const border = (intent === "primary" ? primaryBorder : submitBorder) as ColorLevel;

	const primaryPressedBg = (bg - 200) as ColorLevel;
	const primaryPressedBorder = (border - 100) as ColorLevel;

	const submitPressedBg = (bg - 100) as ColorLevel;
	const submitPressedBorder = (border - 100) as ColorLevel;

	const pressedBg = intent === "primary" ? primaryPressedBg : submitPressedBg;
	const pressedBorder = intent === "primary" ? primaryPressedBorder : submitPressedBorder;

	return {
		background: colors.p[bg],
		border: colors.p[border],

		pressed: {
			background: colors.p[pressedBg],
			border: colors.p[pressedBorder],
		},
	};
};

const Button = (
	props: AriaButtonProps<"button"> & { className?: string; intent?: "primary" | "submit" },
	ref: FocusableRef<HTMLButtonElement>
) => {
	const controls = useAnimation();

	const domRef = useFocusableRef<HTMLButtonElement>(ref);

	const { intent = "primary" } = props;
	const { background, border, pressed } = getColors(intent);

	const {
		buttonProps: {
			// framer motion doesn't like these props, and typescript doesn't like unused vars
			onAnimationStart: _onAnimationStart,
			onAnimationEnd: _onAnimationEnd,
			onDragStart: _onDragStart,
			onDragEnd: _onDragEnd,
			onDrag: _onDrag,
			...buttonProps
		},
	} = useButton(
		{
			...props,
			onPressStart: (e) => {
				props.onPressStart && props.onPressStart(e);
				controls.stop();
				controls.set({
					background: pressed.background,
					borderColor: pressed.border,
				});
			},
			onPressEnd: (e) => {
				props.onPressEnd && props.onPressEnd(e);
				controls.start({
					background: background,
					borderColor: border,
					transition: { duration: 0.4 },
				});
			},
			onPress: (e) => {
				props.onPress && props.onPress(e);

				controls.start({
					background: [null, background],
					borderColor: [null, border],
					transition: { duration: 0.4 },
				});
			},
		},
		domRef
	);

	return (
		<FocusRing focusRingClass="outline-none outline-blue-400 outline outline-[3px] outline-offset-2">
			<motion.button
				ref={domRef}
				animate={controls}
				className={classNames(
					"flex cursor-auto select-none items-center justify-center rounded-md border px-3 py-2 outline-none outline outline-[3px] outline-offset-2 outline-transparent transition-[outline,_opacity] disabled:cursor-not-allowed disabled:text-primary-300 disabled:opacity-50",
					props.className && props.className
				)}
				style={{
					background,
					borderColor: border,
				}}
				{...buttonProps}
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
};

const _Button = forwardRef(Button);
export { _Button as Button };

export const SkeletonButton = ({ className }: { className?: string }) => {
	return (
		<button
			disabled
			className={classNames(
				"rounded-md border border-primary-600 bg-primary-800 px-3 py-2 transition-[outline,_opacity] duration-200 disabled:cursor-not-allowed disabled:opacity-30",
				className
			)}
		>
			<NonBreakingSpace />
		</button>
	);
};
