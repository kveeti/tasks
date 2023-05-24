import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			animation: {
				"spin-slow": "spin 2s linear infinite",
			},
			boxShadow: {
				outline: "0 0 0 4px rgba(66, 153, 225, 0.5)",
				border: `0 2px 0 ${colors.gray[800]}`,
			},
		},
	},
	future: {
		hoverOnlyWhenSupported: true,
	},
	plugins: [],
};
