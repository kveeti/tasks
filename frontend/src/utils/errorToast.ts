import { toast } from "sonner";

export function errorToast(message: string, options?: { id?: string | number }) {
	return function (error: unknown) {
		toast.error(message, {
			description: error instanceof Error ? error.message : String(error),
			id: options?.id,
		});
	};
}
