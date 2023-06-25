import { timingSafeEqual } from "crypto";

export const safeEqual = (a: string, b: string) => {
	const aBuff = Buffer.from(a);
	const bBuff = Buffer.from(b);

	return aBuff.length === bBuff.length && timingSafeEqual(aBuff, bBuff);
};
