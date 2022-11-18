import { ReactNode } from "react";

type Props = {
	children: ReactNode;
};

export const ErrorCard = ({ children }: Props) => {
	return (
		<div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-red-500 bg-red-900/80 px-2 py-[4rem]">
			<h2 className="text-xl">Oh no, an error occured!</h2>

			<i>{children}</i>
		</div>
	);
};
