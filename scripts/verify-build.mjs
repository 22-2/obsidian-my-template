import { access, readFile } from "node:fs/promises";

const requiredAssets = ["main.js", "manifest.json", "styles.css"];

// Validate the exact files that release-it uploads and the manifest fields Obsidian needs.
for (const asset of requiredAssets) {
	await access(new URL(`../${asset}`, import.meta.url));
}

const rootManifest = JSON.parse(
	await readFile(new URL("../manifest.json", import.meta.url), "utf8"),
);
if (typeof rootManifest.id !== "string" || typeof rootManifest.version !== "string") {
	throw new Error("manifest.json must include string id and version fields.");
}

console.log(`Verified ${requiredAssets.join(", ")}.`);
