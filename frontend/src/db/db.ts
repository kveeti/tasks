import Dexie, { type Table } from "dexie";

import { createId } from "@/utils/createId";

export type DbTask = {
	id: string;
	tag_id: string | null;
	is_manual: boolean;
	started_at: Date;
	expires_at: Date;
	stopped_at: Date | null;
	deleted_at: Date | null;
	created_at: Date;
	updated_at: Date;
};

export type DbTag = {
	id: string;
	label: string;
	color: string;
	was_last_used: boolean;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
};

export type DbTaskWithTag = DbTask & { tag?: DbTag };

export type DbNotifSub = {
	id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	created_at: Date;
};

export type NotSynced = {
	id: string;
	target_id: string;
	target_type: "task" | "tag";
};

export const GLOBAL_STATE_ID = "global_state";
export type GlobalState = {
	id: string;
	last_synced_at: Date | null;
};

export class Db extends Dexie {
	tasks!: Table<DbTask>;
	tags!: Table<DbTag>;
	notifSubs!: Table<DbNotifSub>;
	notSynced!: Table<NotSynced>;
	globalState!: Table<GlobalState>;

	constructor() {
		super("db");
		this.version(1).stores({
			tasks: "&id, tag_id, started_at, expires_at, stopped_at, deleted_at, created_at, updated_at",
			tags: "&id, label, color, created_at, updated_at, deleted_at",
			notifSubs: "&id, endpoint, p256dh, auth, created_at",
			notSynced: "&id, target_id, target_type",
			globalState: "&id, last_synced_at",
		});
	}
}

export const db = new Db();

export function addNotSynced(targetId: string, targetType: "task" | "tag") {
	return db.notSynced.put({ id: createId(), target_id: targetId, target_type: targetType });
}

export function addManyNotSynced(
	notSynced: {
		target_id: string;
		target_type: "task" | "tag";
	}[]
) {
	return db.notSynced.bulkPut(notSynced.map((ns) => ({ id: createId(), ...ns })));
}
