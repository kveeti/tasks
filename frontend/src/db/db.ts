import Dexie, { type Table } from "dexie";

export type DbTask = {
	id: string;
	tag_id: string | null;
	expires_at: Date;
	created_at: Date;
	updated_at: Date;
	stopped_at: Date | null;
	deleted_at: Date | null;
};

export type DbTag = {
	id: string;
	label: string;
	color: string;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
};

export type DbTaskWithTag = DbTask & { tag: DbTag };

export type DbNotifSub = {
	id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	created_at: Date;
};

export class Db extends Dexie {
	tasks!: Table<DbTask>;
	tags!: Table<DbTag>;
	notifSubs!: Table<DbNotifSub>;

	constructor() {
		super("db");
		this.version(1).stores({
			tasks: "&id, title, tag_id, expires_at, created_at, updated_at, stopped_at, deleted_at",
			tags: "&id, label, color, created_at, updated_at, deleted_at",
			notifSubs: "&id, endpoint, p256dh, auth, created_at",
		});
	}
}

export const db = new Db();
