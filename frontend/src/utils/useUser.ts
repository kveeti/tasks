import { object, parse, string } from "valibot";

import { useLocalStorage } from "./useLocalStorage";

const userSchema = object({
	id: string(),
	email: string(),
});

export function useUser() {
	const [user] = useLocalStorage("user", null);

	return user ? parse(userSchema, user) : null;
}
