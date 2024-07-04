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

export const tagColors = ["#d13c4b", "#1287A8", "#33a02c", "#f28e2c", "#bc80bd"] as const;

export const tagColorNames = {
	"#d13c4b": "red",
	"#1287A8": "blue",
	"#33a02c": "green",
	"#f28e2c": "orange",
	"#bc80bd": "purple",
} as const;

export type TagColor = (typeof tagColors)[number];
export type TagColorName = (typeof tagColorNames)[keyof typeof tagColorNames];

export function getTagColorName(color: string): TagColorName | "unknown" {
	return tagColorNames[color as TagColor] ?? "unknown";
}

export type ApiNotifSub = {
	id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
	created_at: string;
};
