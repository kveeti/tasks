import { useLocalStorage } from "./useLocalStorage";

export function useLastSyncedAt() {
	const [lastSyncedAt, setLastSyncedAt] = useLocalStorage<string | null>("last-synced-at", null);

	return {
		lastSyncedAt: lastSyncedAt ? new Date(lastSyncedAt) : null,
		setLastSyncedAt,
	};
}
