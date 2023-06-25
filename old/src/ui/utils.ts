import { forwardRef } from "react";

export const forwardRefWithAs = <T extends { name: string; displayName?: string }>(
	component: T
): T & { displayName: string } => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return Object.assign(forwardRef(component as unknown as any) as any, {
		displayName: component.displayName ?? component.name,
	});
};
