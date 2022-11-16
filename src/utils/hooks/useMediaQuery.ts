import { useEffect, useState } from "react";

const getMatches = (query: string): boolean => {
	return window.matchMedia(query).matches;
};

export const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState<boolean>(getMatches(query));

	const handleChange = () => {
		setMatches(getMatches(query));
	};

	useEffect(() => {
		const matchMedia = window.matchMedia(query);

		handleChange();

		if (matchMedia.addEventListener) {
			matchMedia.addEventListener("change", handleChange);
		}

		return () => {
			if (matchMedia.removeEventListener) {
				matchMedia.removeEventListener("change", handleChange);
			}
		};
	}, [query]);

	return matches;
};
