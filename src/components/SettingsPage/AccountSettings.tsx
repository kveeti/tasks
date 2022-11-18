import { RouterOutputs } from "~utils/trpc";

import { EditAccount, SkeletonEditAccount } from "./EditAccount/EditAccount";
import { Logout, SkeletonLogout } from "./Logout";
import { SkeletonUser, User } from "./User";

type Props = { user: RouterOutputs["me"]["getMe"] };

export const AccountSettings = ({ user }: Props) => {
	return (
		<div className="flex flex-col gap-2">
			<User user={user} />
			<EditAccount user={user} />
			<Logout />
		</div>
	);
};

export const SkeletonAccountSettings = () => {
	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<SkeletonUser />
				<SkeletonEditAccount />
				<SkeletonLogout />
			</div>
		</div>
	);
};
