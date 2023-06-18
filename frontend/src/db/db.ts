import Dexie, { type Table } from "dexie";

export type DbTask = {
	id: string;
	tag_id: string | null;
	expires_at: Date;
	created_at: Date;
	updated_at: Date;
	stopped_at: Date | null;
};

export type DbTag = {
	id: string;
	label: string;
	color: string;
	created_at: Date;
	updated_at: Date;
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
			tasks: "&id, title, tagId, userId, expiresAt, createdAt, stoppedAt",
			tags: "&id, label, userId, color, createdAt",
			notifSubs: "&id, endpoint, p256dh, auth, userId, createdAt",
		});
	}
}

export const db = new Db();
