import humanizeDuration from "humanize-duration";

export const humanizer = humanizeDuration.humanizer({
	language: "shortEn",
	languages: {
		shortEn: {
			y: () => "y",
			mo: () => "mo",
			w: () => "w",
			d: () => "d",
			h: () => "h",
			m: () => "m",
			s: () => "s",
			ms: () => "ms",
		},
	},
});
