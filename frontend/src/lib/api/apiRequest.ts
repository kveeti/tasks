import { conf } from "@/lib/conf";

export type ApiError = {
	error: {
		message: string;
	};
};

type Props = {
	path: string;
	method: string;
	body?: unknown;
	query?: Record<string, string>;
	signal?: AbortSignal;
};

export async function apiRequest<TReturnValue>(props: Props) {
	const fetchProps = {
		credentials: "include",
		signal: props.signal,
		method: props.method ?? "GET",
	} as RequestInit;

	if (props.body) {
		fetchProps.body = JSON.stringify(props.body);
		fetchProps.headers = { "Content-Type": "application/json" };
	}

	return fetch(
		`${conf.API_URL}${props.path}${props.query ? `?${new URLSearchParams(props.query)}` : ""}`,
		fetchProps
	)
		.then(async (res) => {
			const json = await res.json().catch(() => null);

			if (res.ok) {
				return json as TReturnValue;
			} else {
				throw new Error(json?.error ?? `unexpected server error - status: ${res.status}`);
			}
		})
		.catch(() => {
			throw new Error("network error");
		});
}
