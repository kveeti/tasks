import Dexie, { type Table } from "dexie";

export type DbTask = {
	id: string;
	tagId: string | null;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	stoppedAt: Date | null;
};

export type DbTag = {
	id: string;
	label: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type DbTaskWithTag = DbTask & { tag: DbTag };

export type DbNotifSub = {
	id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type DbNotif = {
	id: string;
	title: string;
	message: string;
	sendAt: Date;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};

export class Db extends Dexie {
	tasks!: Table<DbTask>;
	tags!: Table<DbTag>;
	notifSubs!: Table<DbNotifSub>;
	notifs!: Table<DbNotif>;

	constructor() {
		super("db");
		this.version(1).stores({
			tasks: "&id, title, tagId, userId, expiresAt, createdAt, stoppedAt",
			tags: "&id, label, userId, color, createdAt",
			notifSubs: "&id, endpoint, p256dh, auth, userId, createdAt",
			notifs: "&id, title, message, sendAt, userId, createdAt",
		});
	}
}

export const db = new Db();
