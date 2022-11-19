import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { classNames } from "~utils/classNames";

const buttonStyles = cva(
	"flex cursor-auto select-none items-center justify-center rounded-md border outline-none outline outline-[3px] outline-offset-2 outline-transparent transition-all duration-200 focus-visible:outline-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-30",
	{
		variants: {
			intent: {
				primary:
					"bg-primary-900 border-primary-700 text-primary-100 hover:bg-primary-800 hover:border-primary-600 active:bg-primary-700 active:border-primary-500",
				submit: "bg-primary-700 border-primary-500 text-primary-100 hover:bg-primary-600 hover:border-primary-500 active:bg-primary-500 active:border-primary-300",
				skeleton: "bg-primary-700 border-primary-600 text-primary-100",
				skeleton_pulse: "bg-primary-700 border-primary-600 text-primary-100 animate-pulse",
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

type Props = ComponentProps<"button"> & VariantProps<typeof buttonStyles>;

export const Button = ({ children, className, type, ...rest }: Props) => {
	return (
		<button
			className={classNames(buttonStyles(rest), className)}
			type={type ?? "button"}
			{...rest}
		>
			{children}
		</button>
	);
};
