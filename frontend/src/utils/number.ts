export function secondsToHours(seconds: number): number {
	return Math.round((seconds / 3600) * 100) / 100;
}
