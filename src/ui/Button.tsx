import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { VariantProps, cva } from "class-variance-authority";
import { motion, useAnimation } from "framer-motion";
import { ComponentProps, ReactNode, useRef } from "react";

import { buttonColors } from "~utils/buttonColors";
import { classNames } from "~utils/classNames";
import { Color } from "~utils/colors";

const buttonStyles = cva(
	"select-none flex items-center rounded-md justify-center border outline-none outline outline-[3px] outline-offset-2 outline-transparent transition-[outline,_opacity] disabled:opacity-30 disabled:cursor-not-allowed",
	{
		variants: {
			intent: {
				primary: buttonColors.primary.CLASSES,
				submit: buttonColors.submit.CLASSES,
				skeleton: buttonColors.primary.CLASSES,
				skeleton_pulse: buttonColors.primary.CLASSES + " animate-pulse",
			},
			size: {
				small: "text-sm px-3 py-2",
				normal: "px-3 py-2",
				large: "text-lg px-4 py-3",
				huge: "text-4xl px-4 py-2",
			},
			marginCenter: { true: "mx-auto" },
			enableTouch: { false: "touch-none", true: "touch-auto" },
		},
		defaultVariants: {
			size: "normal",
			intent: "primary",
			enableTouch: false,
		},
	}
);

type Props = {
	children: ReactNode;
	onClick?: () => void;
} & ComponentProps<"button"> &
	VariantProps<typeof buttonStyles>;

export const Button = ({
	children,
	onClick,
	intent,
	size,
	marginCenter,
	enableTouch,
	type = "button",
	disabled,
	className,
}: Props) => {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();

	const innerIntent = (intent as Color) || "primary";
	const isDisabled = intent === "skeleton" || disabled;

	const { buttonProps } = useButton(
		{
			onPressStart: () => {
				controls.stop();
				controls.set({
					background: buttonColors[innerIntent].onPress.background,
					borderColor: buttonColors[innerIntent].onPress.borderColor,
				});
			},
			onPressEnd: () => {
				controls.start({
					background: buttonColors[innerIntent].background,
					borderColor: buttonColors[innerIntent].borderColor,
					transition: { duration: 0.4 },
				});
			},
			onPress: () => {
				onClick && onClick();
				controls.start({
					background: [null, buttonColors[innerIntent].background],
					borderColor: [null, buttonColors[innerIntent].borderColor],
					transition: { duration: 0.4 },
				});
			},
			isDisabled,
			type,
		},
		ref
	);

	return (
		<FocusRing focusRingClass="outline-none outline-blue-500 outline outline-[3px] outline-offset-2">
			{/* @ts-ignore buttonProps are incompatible at the type level */}
			<motion.button
				ref={ref}
				animate={controls}
				className={classNames(
					buttonStyles({
						intent,
						size,
						marginCenter,
						enableTouch,
					}),
					className
				)}
				{...buttonProps}
				type={type}
			>
				{children}
			</motion.button>
		</FocusRing>
	);
};
