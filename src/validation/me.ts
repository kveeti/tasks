import { z } from "zod";

import { tagLabelSchema, usernameSchema } from "./shared";

export const me = {
	updateMe: {
		form: z.object({ username: usernameSchema }),
		input: z.object({ username: usernameSchema }),
	},

	tags: {
		createTag: {
			form: z.object({ label: tagLabelSchema }),
			input: z.object({ label: tagLabelSchema }),
		},
		updateTag: {
			form: z.object({ label: tagLabelSchema }),
			input: z.object({ tagId: z.string(), label: tagLabelSchema }),
		},
	},

	tasks: {
		createTask: {
			form: z.object({
				expires_after: z.number(), // minutes
				tagId: z.string(),
			}),
			input: z.object({
				expires_after: z.number(), // minutes
				tagId: z.string(),
			}),
		},
	},
};
