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
