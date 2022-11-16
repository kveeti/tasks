import { IoLogoGoogle } from "react-icons/io";

import { ApiUser } from "~api/apiTypes";

type Props = {
	user: ApiUser;
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
