export type ApiTask = {
	id: string;
	tag_id: string | null;
	expires_at: string;
	created_at: string;
	updated_at: string;
	stopped_at: string | null;
};

export type ApiTag = {
	id: string;
	label: string;
	created_at: string;
	updated_at: string;
};

export type ApiNotifSub = {
	id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	created_at: string;
};
