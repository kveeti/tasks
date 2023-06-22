export type ApiError = {
	error: {
		message: string;
	};
};

type Props = {
	path: string;
	method: string;
	body?: any;
	query?: URLSearchParams;
    signal?: AbortSignal;
};

export async function apiRequest<TReturnValue>(props: Props) {
	return fetch(
		`${import.meta.env.VITE_APP_API_URL}${props.path}${props.query ? `?${props.query}` : ""}`,
		{
			method: props.method,
			credentials: "include",
			...(props.body && {
				body: JSON.stringify(props.body),
				headers: { "Content-Type": "application/json" },
			}),
            signal: props.signal,
		}
	).then(async (res) => {
		const json = await res.json().catch(() => null);

		if (res.ok) {
			return json as TReturnValue;
		} else {
			throw new Error(json?.error?.message ?? "Something went wrong");
		}
	});
}
