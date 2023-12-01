import { useRef } from "react";

import { useIntersectionObserver } from "@/utils/hooks/use-intersection-observer";

export function ExecWhenOnScreen({ func }: { func: () => unknown }) {
	const ref = useRef<HTMLDivElement | null>(null);

	const intersectionObserver = useIntersectionObserver(ref, {});

	if (intersectionObserver?.isIntersecting) {
		func();
	}

	return <div ref={ref} aria-hidden></div>;
}
