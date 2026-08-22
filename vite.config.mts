import { obsidianCopyVite } from "@22-2/obsidian-copy-bundler-plugin";
import { builtinModules } from "module";
import path from "path";
import { defineConfig, type UserConfig } from "vite-plus";

const obsidianLintRules = {
	"obsidianmd/commands/no-command-in-command-id": "warn",
	"obsidianmd/commands/no-command-in-command-name": "warn",
	"obsidianmd/commands/no-default-hotkeys": "warn",
	"obsidianmd/commands/no-plugin-id-in-command-id": "warn",
	"obsidianmd/commands/no-plugin-name-in-command-name": "warn",
	"obsidianmd/settings-tab/no-manual-html-headings": "error",
	"obsidianmd/settings-tab/no-problematic-settings-headings": "error",
	"obsidianmd/settings-tab/require-display": "warn",
	"obsidianmd/settings-tab/prefer-setting-definitions": "warn",
	"obsidianmd/settings-tab/prefer-update-over-display": "warn",
	"obsidianmd/settings-tab/no-deprecated-display": "warn",
	"obsidianmd/vault/iterate": "warn",
	"obsidianmd/detach-leaves": "error",
	"obsidianmd/editor-drop-paste": "warn",
	"obsidianmd/hardcoded-config-path": "warn",
	"obsidianmd/no-forbidden-elements": "error",
	"obsidianmd/no-global-this": "warn",
	// Oxlint JS plugins cannot provide ESLint parserServices yet, so rules that
	// require TypeScript type-awareness stay disabled until that API is supported.
	"obsidianmd/no-plugin-as-component": "off",
	"obsidianmd/no-sample-code": "error",
	"obsidianmd/no-tfile-tfolder-cast": "warn",
	"obsidianmd/no-view-references-in-plugin": "off",
	"obsidianmd/no-static-styles-assignment": "error",
	"obsidianmd/object-assign": "warn",
	"obsidianmd/platform": "error",
	"obsidianmd/prefer-get-language": "warn",
	"obsidianmd/prefer-abstract-input-suggest": "warn",
	"obsidianmd/prefer-window-timers": "warn",
	"obsidianmd/regex-lookbehind": "error",
	// This repository is a reusable template, so the sample class names are intentional.
	"obsidianmd/sample-names": "off",
	"obsidianmd/no-nodejs-modules": "warn",
	"obsidianmd/no-unsupported-api": "off",
	"obsidianmd/prefer-create-el": "off",
	"obsidianmd/prefer-file-manager-trash-file": "off",
	"obsidianmd/prefer-instanceof": "off",
	"obsidianmd/ui/sentence-case": ["warn", { enforceCamelCaseLower: true }],
} as const;

export default defineConfig(async ({ mode }) => {
	const { resolve } = path;
	const isWatch = process.argv.includes("--watch");
	const isDev = mode === "development" || isWatch;
	const isProd = !isDev;

	return {
		// Keep the Vite+ pre-commit check explicit because this config is async.
		staged: {
			"*.{js,ts,tsx,vue,svelte}": "vp check --fix",
		},
		lint: {
			ignorePatterns: ["dist/**"],
			options: {
				typeAware: true,
				typeCheck: true,
			},
			// Vite+ reads Oxlint configuration from this block, including JS plugins.
			jsPlugins: [
				{
					name: "obsidianmd",
					specifier: "eslint-plugin-obsidianmd",
				},
			],
			overrides: [
				{
					files: ["src/**/*.ts"],
					rules: obsidianLintRules,
				},
				{
					files: ["manifest.json"],
					rules: {
						"obsidianmd/validate-manifest": "warn",
					},
				},
			],
		},
		plugins: [
			// Ensure CI/build output `dist/` contains files Obsidian expects (manifest.json, main.js)
			obsidianCopyVite({
				targetDir: path.resolve(__dirname, "dist"),
				force: true,
			}),
		],
		build: {
			lib: {
				entry: resolve(__dirname, "src/main.ts"),
				name: "main",
				fileName: () => "main.js",
				formats: ["cjs"],
			},
			minify: isProd,
			sourcemap: isProd ? false : "inline",
			// watchモード時はRollupのwatch設定を渡す
			// ここではsrc配下のファイルを監視対象にしておく（必要に応じて調整してください）
			watch: isWatch ? { include: "src/**" } : undefined,
			cssCodeSplit: false,
			emptyOutDir: false,
			rollupOptions: {
				input: {
					main: resolve(__dirname, "src/main.ts"),
				},
				output: {
					entryFileNames: "main.js",
					assetFileNames: "styles.css",
				},
				external: [
					"obsidian",
					"electron",
					"@codemirror/autocomplete",
					"@codemirror/collab",
					"@codemirror/commands",
					"@codemirror/language",
					"@codemirror/lint",
					"@codemirror/search",
					"@codemirror/state",
					"@codemirror/view",
					"@lezer/common",
					"@lezer/highlight",
					"@lezer/lr",
					...builtinModules,
				],
			},
		},
	} as UserConfig;
});
