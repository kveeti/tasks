import { cn } from "@/lib/utils";

import { Spinner } from "./spinner";
import { Button, type ButtonProps } from "./ui/button";

export function SpinnerButton({
	children,
	className,
	spin,
	...props
}: Exclude<ButtonProps, "asChild"> & { spin?: boolean }) {
	return (
		<Button
			{...props}
			className={cn(
				className,
				"inline-flex transition-all duration-200",
				spin && "opacity-50"
			)}
		>
			<Spinner className={cn("absolute h-[1.2rem]", !spin && "opacity-0")} />

			<span className={cn(spin && "opacity-0")}>{children}</span>
		</Button>
	);
}
