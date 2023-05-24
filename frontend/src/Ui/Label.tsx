import { type ComponentProps, forwardRef } from "react";

import { cn } from "@/utils/classNames";

type Props = ComponentProps<"label"> & {
	required?: boolean;
	error?: boolean;
};

export const Label = forwardRef<HTMLLabelElement, Props>(
	({ children, required, htmlFor, error, className }, ref) => {
		return (
			<label ref={ref} className={cn(error && "text-red-400", className)} htmlFor={htmlFor}>
				{children} {!!required && <b className="text-red-400"> *</b>}
			</label>
		);
	}
);

Label.displayName = "Label";
