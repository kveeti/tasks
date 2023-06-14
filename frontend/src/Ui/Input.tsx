import { forwardRef, useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/utils/classNames";

import { Error } from "./Error";
import { Label } from "./Label";

type InputProps = Omit<ComponentProps<"input">, "ref" | "className">;

type Props = InputProps & {
	label?: string;
	error?: string | ReactNode;
	required?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(
	({ label, required, id, error, ...rest }, ref) => {
		const innerId = useId();

		if (!label)
			return <InnerInput ref={ref} required={required} id={id ?? innerId} {...rest} />;

		const hasError = !!error;

		return (
			<div className="flex flex-col">
				<div className="flex flex-col gap-[6px]">
					<Label htmlFor={id ?? innerId} required={required}>
						{label}
					</Label>

					<InnerInput
						invalid={hasError}
						ref={ref}
						required={required}
						id={id ?? innerId}
						{...rest}
					/>
				</div>

				<Error message={error} />
			</div>
		);
	}
);

const InnerInput = forwardRef<HTMLInputElement, InputProps & { invalid?: boolean }>(
	({ invalid, ...rest }, ref) => {
		return (
			<input
				ref={ref}
				className={cn(
					"w-full rounded-xl border px-2 py-3 outline-none outline-2 transition-[outline,_color,_background,_border] duration-200 focus-visible:outline",
					invalid
						? "border-red-400 bg-red-600 focus-visible:outline-red-400"
						: "border-gray-600 bg-gray-800 focus-visible:outline-gray-500"
				)}
				{...rest}
			/>
		);
	}
);

Input.displayName = "Input";
InnerInput.displayName = "InnerInput";
