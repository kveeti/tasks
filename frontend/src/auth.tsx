import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { z } from "zod";

import { db } from "./db/db";
import { safeJsonParse } from "./utils/safeJsonParse";

const userSchema = z.object({
	id: z.string(),
	email: z.string(),
});

export type User = z.infer<typeof userSchema>;

const userAtom = atom<User | null>(null);
export function useUser<T extends boolean = true>(
	required: T = true as T
): T extends true ? User : User | null {
	const [user] = useAtom(userAtom);

	if (required && !user) throw new Error("User is not logged in");

	return user as T extends true ? User : User | null;
}

export function useSetUser() {
	const [, _setUser] = useAtom(userAtom);

	return (user: User | null) => {
		if (user) {
			const userValidation = userSchema.safeParse(user);

			if (!userValidation.success) {
				throw new Error("invalid user");
			}

			const safeUser = userValidation.data;

			localStorage.setItem("user", JSON.stringify(safeUser));
			_setUser(safeUser);
		} else {
			localStorage.removeItem("user");
			_setUser(null);
		}
	};
}

function useAuth() {
	const setUser = useSetUser();
	const [isLoading, setIsLoading] = useState(true);

	function checkUser() {
		const user = userSchema.safeParse(safeJsonParse(localStorage.getItem("user") ?? ""));

		if (user.success) {
			setUser(user.data);
		} else {
			setUser(null);
		}
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

	return { isLoading, setUser };
}

export function useLogout() {
	const setUser = useSetUser();

	return async () => {
		setUser(null);
		await db.delete();
		localStorage.clear();
	};
}
