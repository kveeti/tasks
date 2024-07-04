import humanizeDuration from "humanize-duration";

export function getMinutesAndSeconds(seconds: number) {
	return {
		minutes: Math.floor(seconds / 60),
		seconds: seconds % 60,
	};
}

export function getHoursAndMinutes(number: number) {
	const hours = Math.floor(number);
	const minutes = Math.round((number - hours) * 60);

	return {
		hours,
		minutes,
	};
}

export function formatTime(date: Date) {
	return Intl.DateTimeFormat(undefined, {
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	}).format(date);
}

export function formatDate(date: Date) {
	return Intl.DateTimeFormat(undefined, {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(date);
}

export function formatMonth(date: Date) {
	return Intl.DateTimeFormat(undefined, {
		month: "short",
		year: "numeric",
	}).format(date);
}

export function getTz() {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

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
