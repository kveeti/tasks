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

export class Db extends Dexie {
	tasks!: Table<Task>;
	tags!: Table<Tag>;

	constructor() {
		super("db");
		this.version(1).stores({
			tasks: "&id, title, tagId, userId, expiresAt, createdAt, stoppedAt",
			tags: "&id, label, userId, color, createdAt",
		});
	}
}

export const db = new Db();
