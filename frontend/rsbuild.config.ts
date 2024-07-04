import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	plugins: [pluginReact({})],
	html: {
		template: "./index.html",
	},
	output: {
		polyfill: "off",
	},
	source: {
		tsconfigPath: "./tsconfig.json",
	},
});
