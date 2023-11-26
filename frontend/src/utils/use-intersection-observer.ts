import { type RefObject, useEffect, useState } from "react";

interface Args extends IntersectionObserverInit {
	freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
	elementRef: RefObject<Element>,
	{ threshold = 0, root = null, rootMargin = "0%", freezeOnceVisible = false }: Args
): IntersectionObserverEntry | undefined {
	const [entry, setEntry] = useState<IntersectionObserverEntry>();

	const frozen = entry?.isIntersecting && freezeOnceVisible;

	useEffect(() => {
		const node = elementRef?.current;
		const hasIOSupport = !!window.IntersectionObserver;

		if (!hasIOSupport || frozen || !node) return;

		const observerParams = { threshold, root, rootMargin };
		const observer = new IntersectionObserver(([entry]) => setEntry(entry), observerParams);

		observer.observe(node);

		return () => observer.disconnect();
	}, [root, rootMargin, frozen, elementRef, threshold]);

	return entry;
}
