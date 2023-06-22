import { type ReactNode, useEffect, useState } from "react";
import { z } from "zod";

import { db } from "./db/db";
import { createCtx } from "./utils/createContext";
import { safeJsonParse } from "./utils/safeJsonParse";

const userSchema = z.object({
	id: z.string(),
	email: z.string(),
});

export type User = z.infer<typeof userSchema>;

const [useContextInner, Context] = createCtx<ReturnType<typeof useContextValue>>();
export const useUserContext = useContextInner;

export function useUser() {
	return useUserContext().user!;
}

export function UserCtxProvider(props: { children: ReactNode }) {
	const contextValue = useContextValue();

	return (
		<Context.Provider value={contextValue}>
			{!contextValue.isLoading && props.children}
		</Context.Provider>
	);
}

function useContextValue() {
	const [_user, _setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	function setUser(user: User) {
		localStorage.setItem("user", JSON.stringify(user));
		_setUser(user);
	}

	function checkUser() {
		const user = userSchema.safeParse(safeJsonParse(localStorage.getItem("user") ?? ""));

		if (user.success) {
			setUser(user.data);
		} else {
			_setUser(null);
			localStorage.clear();
		}
	}

	async function logout() {
		_setUser(null);
		await db.delete();
		localStorage.clear();
	}

	useEffect(() => {
		setIsLoading(true);
		checkUser();
		setIsLoading(false);

		window.addEventListener("storage", checkUser);
		window.addEventListener("focus", checkUser);
		window.addEventListener("blur", checkUser);

		return () => {
			window.removeEventListener("storage", checkUser);
			window.removeEventListener("focus", checkUser);
			window.removeEventListener("blur", checkUser);
		};
	}, []);

	return {
		isLoading,
		user: _user,
		setUser,
		logout,
	};
}
