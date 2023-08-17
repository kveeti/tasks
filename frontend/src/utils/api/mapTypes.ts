import type { DbTag, DbTask } from "@/db/db";

import type { ApiTag, ApiTask } from "./types";

export function mapApiTagToDbTag(apiTag: ApiTag): DbTag {
	return {
		...apiTag,
		created_at: new Date(apiTag.created_at),
		updated_at: new Date(apiTag.updated_at),
		deleted_at: apiTag.deleted_at ? new Date(apiTag.deleted_at) : null,
	};
}

export function mapDbTagToApiTag(dbTag: DbTag): ApiTag {
	return {
		...dbTag,
		created_at: dbTag.created_at.toISOString(),
		updated_at: dbTag.updated_at.toISOString(),
		deleted_at: dbTag.deleted_at?.toISOString() ?? null,
	};
}

export function mapApiTaskToDbTask(apiTask: ApiTask): DbTask {
	return {
		...apiTask,
		started_at: new Date(apiTask.started_at),
		created_at: new Date(apiTask.created_at),
		updated_at: new Date(apiTask.updated_at),
		expires_at: new Date(apiTask.expires_at),
		stopped_at: apiTask.stopped_at ? new Date(apiTask.stopped_at) : null,
		deleted_at: apiTask.deleted_at ? new Date(apiTask.deleted_at) : null,
	};
}
