type Props = {
	children: React.ReactNode;
};

export function AuthLayout(props: Props) {
	return (
		<div className="flex h-full flex-col justify-center">
			<main className="flex flex-col items-center">{props.children}</main>
		</div>
	);
}
