import { VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { classNames } from "~utils/classNames";

import { NonBreakingSpace } from "./NonBreakingSpace";

const buttonStyles = cva(
	`flex 
    cursor-auto touch-none select-none 
    items-center justify-center 
    rounded-md border 
    outline-none outline outline-[3px] outline-offset-2 outline-transparent 
    transition-all duration-200 
    disabled:cursor-not-allowed disabled:text-gray-300 disabled:opacity-50 
    focus-visible:outline-offset-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-400`,
	{
		variants: {
			intent: {
				primary:
					"bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500 active:bg-gray-600 active:border-gray-500",
				submit: "bg-gray-600 border-gray-500 hover:bg-gray-500/80 hover:border-gray-400 active:bg-gray-500 active:border-gray-400",
				danger: "bg-red-600/70 border-red-500/80 hover:bg-red-600 hover:border-red-500 active:bg-red-500/90 active:border-red-400/80",
			},
			marginCenter: { true: "mx-auto" },
			enableTouch: { false: "touch-none", true: "touch-auto" },
			size: {
				small: "px-1 py-1 text-sm",
				base: "px-3 py-2",
			},
		},
		defaultVariants: {
			intent: "primary",
			enableTouch: false,
			size: "base",
		},
	}
);

type Props = ComponentProps<"button"> & VariantProps<typeof buttonStyles>;

export const Button = ({ className, ...props }: Props) => {
	return (
		<button
			className={classNames(buttonStyles(props), !!className && className)}
			{...props}
			type={props.type ?? "button"}
		>
			{props.children}
		</button>
	);
};

export const SkeletonButton = ({ className }: { className?: string }) => {
	return (
		<button
			disabled
			className={classNames(
				"rounded-md border border-gray-600 bg-gray-800 px-3 py-2 transition-[outline,_opacity] duration-200 disabled:cursor-not-allowed disabled:opacity-30",
				className
			)}
		>
			<NonBreakingSpace />
		</button>
	);
};
