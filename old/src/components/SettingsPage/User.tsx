import { IoLogoGoogle } from "react-icons/io";

import { Card, SkeletonCard } from "~ui/Card";
import type { RouterOutputs } from "~utils/trpc";

type Props = {
	user: RouterOutputs["me"]["getMe"];
};

export const User = ({ user }: Props) => {
	return (
		<Card className="rounded-xl">
			<div className="flex items-center justify-between gap-2 p-4">
				<div className="flex flex-col truncate">
					<span className="truncate">{user.username}</span>
					<span className="truncate text-sm">{user.email}</span>
				</div>

				<IoLogoGoogle className="text-[35px]" />
			</div>
		</Card>
	);
};

export const SkeletonUser = () => {
	return (
		<SkeletonCard className="rounded-xl">
			<div className="flex items-center justify-between gap-2 p-4">
				<div className="flex flex-col gap-2 truncate">
					<span className="border-primary-700 bg-primary-800 h-5 w-[6rem] rounded-md border" />
					<span className="border-primary-700 bg-primary-800 h-4 w-[10rem] rounded-md border" />
				</div>

				<div className="border-primary-700 bg-primary-800 h-9 w-9 rounded-full border" />
			</div>
		</SkeletonCard>
	);
};
