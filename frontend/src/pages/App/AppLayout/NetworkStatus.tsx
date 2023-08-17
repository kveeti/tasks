import { useIsOnline } from "@/utils/useIsOnline";

export function NetworkStatus() {
	const isOnline = useIsOnline();

	if (isOnline) return null;

	return (
		<span className="text-sm bg-red-900 border border-red-700 px-2 py-1 rounded-full">
			offline
		</span>
	);
}
