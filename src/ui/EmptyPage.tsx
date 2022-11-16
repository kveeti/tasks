import { ReactNode } from "react";

import { classNames } from "~utils/classNames";
import { useTitle } from "~utils/hooks/useTitle";

type Props = {
	title: string;
	children: ReactNode;
};

export const EmptyPage = ({ children, title }: Props) => {
	useTitle(title);

	return (
		<main
			className={classNames(
				"mx-auto mt-4 max-w-page rounded-xl border border-p-700 bg-p-800"
			)}
		>
			{children}
		</main>
	);
};
