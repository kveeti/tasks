function getUserId() {
	return localStorage.getItem("userId");
}

/**
 * Should only be used in components that are
 * rendered with userId checks in their parents.
 */
export function useUserId() {
	return getUserId()!;
}
