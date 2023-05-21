import Dexie, { type Table } from "dexie";

export type DbTask = {
	id: string;
	tagId: string | null;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	stoppedAt: Date | null;
};

export type DbTag = {
	id: string;
	label: string;
	createdAt: Date;
	updatedAt: Date;
};

export type DbTaskWithTag = DbTask & { tag: DbTag };

export type DbNotifSub = {
	id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	createdAt: Date;
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
