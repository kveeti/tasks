import { colors } from "./colors";

export const buttonColors = {
	primary: {
		CLASSES: "bg-p-700 border-p-600 text-p-100",

		background: colors.primary[700],
		borderColor: colors.primary[600],
		color: colors.primary[100],

		onPress: {
			background: colors.primary[600],
			borderColor: colors.primary[500],
			color: colors.primary[100],
		},
	},
	submit: {
		CLASSES: "bg-p-600 border-p-500 text-p-100",

		background: colors.primary[600],
		borderColor: colors.primary[500],
		color: colors.primary[100],

		onPress: {
			background: colors.primary[500],
			borderColor: colors.primary[400],
			color: colors.primary[100],
		},
	},
};
