import { access, readFile } from "node:fs/promises";

const requiredAssets = ["main.js", "manifest.json", "styles.css"];

// Validate the exact files that release-it uploads so a successful build cannot
// produce a release with a missing or stale Obsidian manifest.
for (const asset of requiredAssets) {
	await access(new URL(`../dist/${asset}`, import.meta.url));
}

const rootManifest = JSON.parse(
	await readFile(new URL("../manifest.json", import.meta.url), "utf8"),
);
const distManifest = JSON.parse(
	await readFile(new URL("../dist/manifest.json", import.meta.url), "utf8"),
);

for (const field of ["id", "version"]) {
	if (rootManifest[field] !== distManifest[field]) {
		throw new Error(`dist/manifest.json has a different ${field} from manifest.json.`);
	}
}

console.log(`Verified ${requiredAssets.join(", ")}.`);
