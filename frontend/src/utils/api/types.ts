export type ApiTask = {
	id: string;
	tag_id: string | null;
	is_manual: boolean;
	started_at: string;
	expires_at: string;
	stopped_at: string | null;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
};

export type ApiTag = {
	id: string;
	label: string;
	color: string;
	was_last_used: boolean;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

export type ApiNotifSub = {
	id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	created_at: string;
};
