export type ApiError = {
	error: {
		message: string;
	};
};

type Props = {
	path: string;
	method: string;
	body?: unknown;
	query?: URLSearchParams;
	signal?: AbortSignal;
};

export async function apiRequest<TReturnValue>(props: Props) {
	return fetch(
		`${import.meta.env.VITE_APP_API_URL}${props.path}${props.query ? `?${props.query}` : ""}`,
		{
			signal: props.signal,
			method: props.method,
			credentials: "include",
			...(!!props.body && {
				body: JSON.stringify(props.body),
				headers: { "Content-Type": "application/json" },
			}),
		}
	).then(async (res) => {
		const json = await res.json().catch(() => null);

		if (res.ok) {
			return json as TReturnValue;
		} else {
			throw new Error(json?.error ?? `unexpected server error - status: ${res.status}`, {});
		}
	});
}
