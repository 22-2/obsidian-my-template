import { builtinModules } from 'node:module';
import process from 'node:process';
import esbuild from 'esbuild';

const isProduction = process.argv[2] === 'production';

const context = await esbuild.context({
	entryPoints: ['src/main.ts'],
	bundle: true,
	platform: 'browser',
	format: 'cjs',
	target: 'es2021',
	logLevel: 'info',
	minify: isProduction,
	sourcemap: isProduction ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js',
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		...builtinModules,
	],
});

if (isProduction) {
	try {
		const result = await context.rebuild();
		if (result.errors.length > 0) process.exitCode = 1;
	} finally {
		await context.dispose();
	}
} else {
	await context.watch();
}
