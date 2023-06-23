import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			mode: "development",
			base: "/",
			strategies: "injectManifest",
			srcDir: "src",
			filename: "sw.ts",
			devOptions: {
				enabled: true,
				type: "module",
				navigateFallback: "index.html",
			},
		}),
		tsconfigPaths(),
	],
});
