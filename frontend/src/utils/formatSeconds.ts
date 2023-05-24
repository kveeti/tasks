export function getMinutesAndSeconds(seconds: number) {
	return {
		minutes: String(Math.floor(seconds / 60)).padStart(2, "0"),
		seconds: String(seconds % 60).padStart(2, "0"),
	};
}
