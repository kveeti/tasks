import { ComponentProps, ReactNode, forwardRef, useId } from "react";

import { classNames } from "~utils/classNames";

import { Error } from "./Error";
import { ChevronDown } from "./Icons/ChevronDown";
import { Label } from "./Label";

type InputProps = Omit<ComponentProps<"select">, "ref" | "className">;

type Props = InputProps & {
	label?: string;
	error?: string | ReactNode;
	required?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, Props>(
	({ label, required, id, error, children, ...rest }, ref) => {
		const innerId = useId();

		if (!label)
			return <InnerSelect ref={ref} required={required} id={id ?? innerId} {...rest} />;

		const hasError = !!error;

		return (
			<div className="flex flex-col">
				<div className="flex flex-col gap-[6px]">
					<Label htmlFor={id ?? innerId} required={required}>
						{label}
					</Label>

					<InnerSelect
						invalid={hasError}
						ref={ref}
						required={required}
						id={id ?? innerId}
						{...rest}
					>
						{children}
					</InnerSelect>
				</div>

				<Error message={error} />
			</div>
		);
	}
);

const InnerSelect = forwardRef<HTMLSelectElement, InputProps & { invalid?: boolean }>(
	({ invalid, children, ...rest }, ref) => {
		return (
			<div className="relative">
				<select
					ref={ref}
					className={classNames(
						"w-full appearance-none rounded-md border p-2 outline-none outline-[3px] transition-[outline,_color,_background,_border] duration-200 focus-visible:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2",
						invalid
							? "border-red-400 bg-red-600 focus-visible:outline-red-400"
							: "border-primary-400 bg-primary-600 hover:border-primary-200 focus-visible:outline-blue-400"
					)}
					{...rest}
				>
					{children}
				</select>

				<div className="absolute right-[0.55rem] top-[0.7rem]">
					<ChevronDown />
				</div>
			</div>
		);
	}
);

Select.displayName = "Select";
InnerSelect.displayName = "InnerSelect";
