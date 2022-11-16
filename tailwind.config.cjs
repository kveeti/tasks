const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				p: colors.stone,
			},
			maxWidth: {
				page: "280px",
			},
			keyframes: {
				"my-pulse": { "50%": { opacity: 0.3 } },
				second: { "50%": { opacity: 0.3 } },
			},
			animation: {
				"my-pulse": "my-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				second: "my-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			},
		},
	},
	plugins: [],
};
