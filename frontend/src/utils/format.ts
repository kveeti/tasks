export function getMinutesAndSeconds(seconds: number) {
	return {
		minutes: String(Math.floor(seconds / 60)).padStart(2, "0"),
		seconds: String(seconds % 60).padStart(2, "0"),
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
