import { useEffect, useRef } from "react";

export function useSetInterval(callback: () => void, delay: number | null) {
	const savedCallback = useRef(callback);

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!delay && delay !== 0) {
			return;
		}

		const id = setInterval(() => savedCallback.current(), delay);

		return () => clearInterval(id);
	}, [delay]);
}

export function useSetTimeout(callback: () => void, delay: number | null) {
	const savedCallback = useRef(callback);

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!delay && delay !== 0) {
			return;
		}

		const id = setTimeout(() => savedCallback.current(), delay);

		return () => clearTimeout(id);
	}, [delay]);
}
