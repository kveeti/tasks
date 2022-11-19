import { VariantProps, cva } from "class-variance-authority";
import { ComponentProps, forwardRef } from "react";

import { classNames } from "~utils/classNames";

const cardStyles = cva("border", {
	variants: {
		variant: {
			1: "border-primary-800 bg-primary-1100",
			2: "border-primary-700 bg-primary-1000",
			3: "border-primary-600 bg-primary-900",
		},
	},
	defaultVariants: {
		variant: 1,
	},
});

type Props = ComponentProps<"div"> & VariantProps<typeof cardStyles>;

export const Card = forwardRef<HTMLDivElement, Props>(({ children, className, ...rest }, ref) => {
	return (
		<div ref={ref} className={classNames(cardStyles(rest), className)} {...rest}>
			{children}
		</div>
	);
});

Card.displayName = "Card";

export const SkeletonCard = forwardRef<HTMLDivElement, Props>(
	({ children, className, ...rest }, ref) => {
		return (
			<div ref={ref} className={classNames(cardStyles(rest), className)} {...rest}>
				{children}
			</div>
		);
	}
);

SkeletonCard.displayName = "SkeletonCard";
