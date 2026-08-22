// Vite handles CSS imports at build time; this declaration keeps TypeScript
// aware of the side-effect import used to emit the plugin stylesheet.
declare module "*.css" {
	const css: string;
	export default css;
}
