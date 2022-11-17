import { AnimatePresence, motion } from "framer-motion";
import { ComponentProps, ReactNode, forwardRef, useId } from "react";

import { classNames } from "~utils/classNames";

import { Error } from "./Error";

type InputProps = Omit<ComponentProps<"input">, "ref" | "className">;

type Props = InputProps & {
	label?: string;
	error?: string | ReactNode;
	required?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(
	({ label, required, id = useId(), error, ...rest }, ref) => {
		if (!label) return <InnerInput ref={ref} required={required} id={id} {...rest} />;

		const hasError = !!error;

		return (
			<div className="flex flex-col">
				<div className="flex flex-col gap-[6px]">
					<label className="text-sm" htmlFor={id}>
						{label} {required && <b className="text-red-500">*</b>}
					</label>

					<InnerInput
						invalid={hasError}
						ref={ref}
						required={required}
						id={id}
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
				className={classNames(
					"w-full rounded-md border p-2 outline-none outline-[3px] transition-[outline,_color,_background,_border] duration-200 focus-visible:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2",
					invalid
						? "border-red-500 bg-red-900 focus-visible:outline-red-500"
						: "border-p-500 bg-p-600 focus-visible:outline-blue-500"
				)}
				{...rest}
			/>
		);
	}
);
