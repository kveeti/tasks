import { useEffect } from "react";

export const useTitle = (title: string, shouldSet = true) => {
	useEffect(() => {
		if (!shouldSet) return;
		document.title = `Tasks | ${title}`;
	}, [title]);
};
