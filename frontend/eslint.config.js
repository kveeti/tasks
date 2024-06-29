import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{ files: ["./src/**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
	{ ignores: ["dist"] },
	{
		languageOptions: {
			parserOptions: { ecmaFeatures: { jsx: true } },
			globals: { ...globals.browser },
		},
	},
	{
		plugins: {
			react: eslintPluginReact,
			"react-hooks": fixupPluginRules(eslintPluginReactHooks),
		},
	},
	{
		rules: {
			...eslintPluginReactHooks.configs.recommended.rules,
			"no-mixed-spaces-and-tabs": "off",
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{ fixStyle: "inline-type-imports", disallowTypeAnnotations: false },
			],
			"@typescript-eslint/array-type": ["error", { default: "generic", readonly: "generic" }],
		},
	}
);
