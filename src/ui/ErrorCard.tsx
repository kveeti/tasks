import type { ReactNode } from "react";

import { classNames } from "~utils/classNames";

type Props = {
	children: ReactNode;
	inside?: boolean;
};

export const ErrorCard = ({ children, inside }: Props) => {
	return (
		<div
			className={classNames(
				"flex flex-col items-center justify-between gap-6 border border-red-500 bg-red-900/80 px-2 py-[4rem]",
				inside ? "rounded-md" : "rounded-xl"
			)}
		>
			<h2 className="text-xl">Oh no, an error occured!</h2>

			<i>{children}</i>
		</div>
	);
};
