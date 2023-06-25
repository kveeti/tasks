import { useNetworkStatus } from "@/utils/networkStatus";

export function NetworkStatus() {
	const networkStatus = useNetworkStatus();

	if (networkStatus.isOnline) return null;

	return (
		<span className="text-sm bg-red-900 border border-red-700 px-2 py-1 rounded-full">
			offline
		</span>
	);
}
