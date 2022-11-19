import { Button } from "~ui/Button";

type Props = {
	onPress?: () => void;
	disabled?: boolean;
};

export const EditAccountButton = ({ onPress, disabled }: Props) => {
	return (
		<Button onPress={onPress} isDisabled={disabled}>
			Edit account
		</Button>
	);
};
