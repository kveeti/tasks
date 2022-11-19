/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
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
				red: {
					1200: "#1f1315",
					1100: "#291415",
					1000: "#3c181a",
					900: "#481a1d",
					800: "#541b1f",
					700: "#671e22",
					600: "#822025",
					500: "#aa2429",
					400: "#e5484d",
					300: "#f2555a",
					200: "#ff6369",
					100: "#feecee",
				},
				blue: {
					1200: "#0f1720",
					1100: "#0f1b2d",
					1000: "#10243e",
					900: "#102a4c",
					800: "#0f3058",
					700: "#0d3868",
					600: "#0a4481",
					500: "#0954a5",
					400: "#0091ff",
					300: "#369eff",
					200: "#52a9ff",
					100: "#eaf6ff",
				},
			},
			maxWidth: {
				page: "300px",
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
	future: {
		hoverOnlyWhenSupported: true,
	},
	plugins: [],
};
