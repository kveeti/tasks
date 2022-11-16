import { ReactNode } from "react";

import { classNames } from "~utils/classNames";

type Props = {
	children: ReactNode;
	htmlFor: string;
	required?: boolean;
	error?: boolean;
};

export const Label = ({ children, required, htmlFor, error }: Props) => {
	return (
		<label className={classNames("text-sm", error && "text-red-500")} htmlFor={htmlFor}>
			{children} {!!required && <b className="text-red-500"> *</b>}
		</label>
	);
};
