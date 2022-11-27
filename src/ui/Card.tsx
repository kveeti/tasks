import { VariantProps, cva } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from "react";

import { classNames } from "~utils/classNames";

import { forwardRefWithAs } from "./utils";

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

type Props<T extends ElementType = "div"> = {
	as?: T;
	children: ReactNode;
	className?: string;
} & ComponentPropsWithoutRef<T> &
	VariantProps<typeof cardStyles>;

export const Card = forwardRefWithAs(
	<T extends ElementType>(props: Props<T>, ref: Ref<HTMLDivElement>) => {
		const { as: Component = "div", children, className, ...rest } = props;

		return (
			<Component ref={ref} className={classNames(cardStyles(rest), className)} {...rest}>
				{children}
			</Component>
		);
	}
);

export const SkeletonCard = forwardRefWithAs(
	<T extends ElementType>(props: Props<T>, ref: Ref<HTMLDivElement>) => {
		const { as: Component = "div", children, className, ...rest } = props;

		return (
			<Component ref={ref} className={classNames(cardStyles(rest), className)} {...rest}>
				{children}
			</Component>
		);
	}
);

SkeletonCard.displayName = "SkeletonCard";
