import * as React from "react";

import { cn } from "@/lib/classnames";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, autoComplete, ...props }, ref) => {
		return (
			<input
				type={type}
				autoComplete={autoComplete ?? "off"}
				className={cn(
					"focus flex h-12 w-full rounded-md border border-input bg-card-item px-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);

Input.displayName = "Input";

export { Input };
