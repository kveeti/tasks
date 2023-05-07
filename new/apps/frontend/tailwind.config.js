/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					1200: "#161615",
					1100: "#1c1c1a",
					1000: "#232320",
					900: "#282826",
					800: "#2e2e2b",
					700: "#353431",
					600: "#3e3e3a",
					500: "#51504b",
					400: "#717069",
					300: "#7f7e77",
					200: "#a1a09a",
					100: "#ededec",
				},
			},
			animation: {
				"spin-slow": "spin 2s linear infinite",
			},
			boxShadow: {
				outline: "0 0 0 3px rgba(66, 153, 225, 0.5)",
			},
		},
	},
	future: {
		hoverOnlyWhenSupported: true,
	},
	plugins: [],
};
