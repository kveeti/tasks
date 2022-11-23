import { Button } from "~ui/Button";

type Props = {
	onClick?: () => void;
	disabled?: boolean;
};

export const EditAccountButton = ({ onClick, disabled }: Props) => {
	return (
		<Button onClick={onClick} disabled={disabled}>
			Edit account
		</Button>
	);
};
