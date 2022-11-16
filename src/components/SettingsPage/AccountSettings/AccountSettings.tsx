import { ApiUser } from "~types/apiTypes";

import { EditAccountModal } from "./EditAccount/EditAccountModal";
import { Logout } from "./Logout";
import { User } from "./User";

type Props = { user: ApiUser };

export const AccountSettings = ({ user }: Props) => {
	return (
		<div className="flex flex-col gap-2">
			<User user={user} />
			<EditAccountModal user={user} />
			<Logout />
		</div>
	);
};
