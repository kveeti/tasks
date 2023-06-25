import { useEffect, useState } from "react";

import { createCtx } from "./createContext";

const [useContextInner, Context] = createCtx<ReturnType<typeof useContextValue>>();

export const useNetworkStatus = useContextInner;

function useContextValue() {
	const [isOnline, setIsOnline] = useState(navigator.onLine);

	useEffect(() => {
		function checkStatus() {
			setIsOnline(navigator.onLine);
		}

		window.addEventListener("online", checkStatus);
		window.addEventListener("offline", checkStatus);

		return () => {
			window.removeEventListener("online", checkStatus);
			window.removeEventListener("offline", checkStatus);
		};
	}, []);

	return {
		isOnline,
	};
}

export function NetworkStatusContextProvider(props: { children: React.ReactNode }) {
	const value = useContextValue();

	return <Context.Provider value={value}>{props.children}</Context.Provider>;
}
