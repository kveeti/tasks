import { VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { classNames } from "~utils/classNames";

import { NonBreakingSpace } from "./NonBreakingSpace";

const buttonStyles = cva(
	`flex 
    cursor-auto touch-none select-none 
    items-center justify-center 
    rounded-md border 
    px-3 py-2 
    outline-none outline outline-[3px] outline-offset-2 outline-transparent 
    transition-all duration-200 
    disabled:cursor-not-allowed disabled:text-primary-300 disabled:opacity-50 
    focus-visible:outline-offset-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-400`,
	{
		variants: {
			intent: {
				primary:
					"bg-primary-800 border-primary-600 hover:bg-primary-700 hover:border-primary-500 active:bg-primary-600 active:border-primary-500",
				submit: "bg-primary-600 border-primary-500 hover:bg-primary-500/80 hover:border-primary-400 active:bg-primary-500 active:border-primary-400",
				danger: "bg-red-600 border-red-500 hover:bg-red-500/80 hover:border-red-400 active:bg-red-500 active:border-red-400",
			},
			marginCenter: { true: "mx-auto" },
			enableTouch: { false: "touch-none", true: "touch-auto" },
		},
		defaultVariants: {
			intent: "primary",
			enableTouch: false,
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
				"rounded-md border border-primary-600 bg-primary-800 px-3 py-2 transition-[outline,_opacity] duration-200 disabled:cursor-not-allowed disabled:opacity-30",
				className
			)}
		>
			<NonBreakingSpace />
		</button>
	);
};
