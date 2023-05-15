import Dexie, { type Table } from "dexie";

export type Task = {
	id: string;
	tag: Pick<Tag, "id" | "label">;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	stoppedAt: Date | null;
};

export type Tag = {
	id: string;
	label: string;
	userId: string;
	color: string;
	createdAt: Date;
};

export type NotifSub = {
	id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	userId: string;
	createdAt: Date;
};

export type Notif = {
	id: string;
	title: string;
	message: string;
	sendAt: Date;
	userId: string;
	createdAt: Date;
};

export class Db extends Dexie {
	tasks!: Table<Task>;
	tags!: Table<Tag>;
	notifSubs!: Table<NotifSub>;
	notifs!: Table<Notif>;

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
