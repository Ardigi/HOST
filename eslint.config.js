import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		files: ['**/*.svelte'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				// Reference the POS app's svelte.config.js which has runes: true
				svelteConfig: './apps/pos/svelte.config.js',
				parser: ts.parser,
			},
		},
		rules: {
			// Svelte-specific best practices
			'svelte/no-at-html-tags': 'error',
			'svelte/no-reactive-reassign': 'error',
			'svelte/require-optimized-style-attribute': 'warn',

			// Disable overly strict SvelteKit rules
			'svelte/no-navigation-without-resolve': 'off', // Standard href patterns are fine

			// Disable TypeScript rules that conflict with Svelte reactivity
			'@typescript-eslint/no-unused-vars': 'off', // Svelte plugin handles this
		},
	},
	{
		// Ignore files
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/.svelte-kit/**',
			'**/coverage/**',
			'**/.turbo/**',
		],
	}
);
