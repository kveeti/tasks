import { z } from "zod";

import { tagColorsEnum } from "~components/IndexPage/Timer/Tags/tagColors";

import { tagLabelSchema, usernameSchema } from "./shared";

export const me = {
	updateMe: {
		form: z.object({ username: usernameSchema }),
		input: z.object({ username: usernameSchema }),
	},

	tags: {
		createTag: {
			form: z.object({ label: tagLabelSchema, color: tagColorsEnum }),
			input: z.object({ label: tagLabelSchema, color: tagColorsEnum }),
		},
		updateTag: {
			form: z.object({ label: tagLabelSchema, color: tagColorsEnum }),
			input: z.object({ tagId: z.string(), label: tagLabelSchema, color: tagColorsEnum }),
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
