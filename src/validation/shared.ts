import { z } from "zod";

export const tagLabelSchema = z.string().min(1).max(20);
export const usernameSchema = z
	.string()
	.min(1, { message: "Required" })
	.min(3, { message: "Too short!" })
	.max(25, { message: "Too long!" });
