import { readFileSync } from "node:fs";
import { expect, test } from "obsidian-e2e-toolkit";

const { id: pluginId } = JSON.parse(
	readFileSync(new URL("../manifest.json", import.meta.url), "utf8"),
) as { id: string };

test.use({
	vaultOptions: {
		plugins: [{ path: process.cwd() }],
	},
});

test("Obsidian starts and loads the plugin", async ({ obsidian }) => {
	expect(await obsidian.isPluginLoaded(pluginId)).toBe(true);
});
