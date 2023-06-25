import { useLiveQuery } from "dexie-react-hooks";

import { db } from "./db";

export function useDbTags(deps: unknown[] = []) {
	return useLiveQuery(
		() =>
			db.tags
				.orderBy("created_at")
				.filter((t) => !t.deleted_at)
				.reverse()
				.toArray(),
		deps
	);
}
