import { useState, type ReactNode, useEffect } from "react";
import { createCtx } from "../utils/createContext";

const [useContextInner, Context] = createCtx<ReturnType<typeof useContextValue>>();
export const useUserIdContext = useContextInner;

/**
 * Should only be used in components that have
 * a <UserIdProvider> ancestor
 */
export function useUserId() {
	return useUserIdContext().userId!;
}

export function UserIdProvider(props: { children: ReactNode }) {
	const contextValue = useContextValue();

	return (
		<Context.Provider value={contextValue}>
			{!contextValue.isLoading && props.children}
		</Context.Provider>
	);
}

function useContextValue() {
	const [_userId, _setUserId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	function checkUserId() {
		setIsLoading(true);
		const userId = localStorage.getItem("userId");

		if (userId) {
			setUserId(userId);
		} else {
			_setUserId(null);
			localStorage.clear();
		}

		setIsLoading(false);
	}

	function setUserId(userId: string) {
		localStorage.setItem("userId", userId);
		_setUserId(userId);
	}

	useEffect(() => {
		checkUserId();

		window.addEventListener("storage", checkUserId);
		window.addEventListener("focus", checkUserId);
		window.addEventListener("blur", checkUserId);

		return () => {
			window.removeEventListener("storage", checkUserId);
			window.removeEventListener("focus", checkUserId);
			window.removeEventListener("blur", checkUserId);
		};
	}, []);

	return {
		userId: _userId,
		setUserId,
		isLoading,
	};
}
