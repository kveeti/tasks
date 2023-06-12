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
				up: "rgba(0, 0, 0, 0.1) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;",
				down: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;",
			},
			screens: {
				"not-mobile": "671px",
			},
			width: {
				mobile: "671px",
			},
			colors: {
				glassGray: "rgba(20, 20, 20, 0.2)",
			},
			blur: {
				glass: "16px",
			},
		},
	},
	future: {
		hoverOnlyWhenSupported: true,
	},
	plugins: [],
};
