export const tagColors = ["#d13c4b", "#1287A8", "#33a02c", "#f28e2c", "#bc80bd"] as const;
export const tagColors2 = [
	["red", "#d13c4b"],
	["blue", "#1287A8"],
	["green", "#33a02c"],
	["orange", "#f28e2c"],
	["purple", "#bc80bd"],
] as const;
export type TagColors = (typeof tagColors)[number];
