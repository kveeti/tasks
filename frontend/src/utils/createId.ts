import { ulid } from "ulid";

export function createId() {
	return ulid();
}
