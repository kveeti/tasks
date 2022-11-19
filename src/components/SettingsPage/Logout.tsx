import { signOut } from "next-auth/react";

import { Button, SkeletonButton } from "~ui/Button";

type Props = {
	disabled?: boolean;
};

export const Logout = ({ disabled }: Props) => {
	return (
		<Button onPress={() => signOut()} isDisabled={disabled}>
			Logout
		</Button>
	);
};

export const SkeletonLogout = () => {
	return <SkeletonButton className="w-full" />;
};
