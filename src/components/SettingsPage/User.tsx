import { IoLogoGoogle } from "react-icons/io";

import type { RouterOutputs } from "~utils/trpc";

type Props = {
	user: RouterOutputs["me"]["getMe"];
};

export const User = ({ user }: Props) => {
	return (
		<div className="flex items-center justify-between gap-2 rounded-xl border border-p-700 bg-p-800 p-4">
			<div className="flex flex-col truncate">
				<span className="truncate">{user.username}</span>
				<span className="truncate text-sm">{user.email}</span>
			</div>

			<IoLogoGoogle className="text-[35px]" />
		</div>
	);
};

export const SkeletonUser = () => {
	return (
		<div className="flex items-center justify-between gap-2 rounded-xl border border-p-700 bg-p-800 p-4">
			<div className="flex flex-col truncate">
				<span className="truncate">username</span>
				<span className="truncate text-sm">email</span>
			</div>

			<IoLogoGoogle className="text-[35px]" />
		</div>
	);
};
