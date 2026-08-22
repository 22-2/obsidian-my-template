import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";

const rootDir = process.cwd();

function readJson(relativePath: string): Record<string, unknown> {
	return JSON.parse(readFileSync(resolve(rootDir, relativePath), "utf8"));
}

describe("template release invariants", () => {
	it("keeps package and manifest versions aligned", () => {
		const packageJson = readJson("package.json");
		const manifest = readJson("manifest.json");

		expect(manifest.version).toBe(packageJson.version);
	});

	it("does not rewrite versions.json during a dry run", () => {
		const versionsPath = resolve(rootDir, "versions.json");
		const before = readFileSync(versionsPath, "utf8");
		const manifest = readJson("manifest.json");
		const minAppVersion = String(manifest.minAppVersion);
		const output = execFileSync(
			process.execPath,
			["scripts/update-versions.mjs", "99.99.99", "--dry-run"],
			{ cwd: rootDir, encoding: "utf8" },
		);

		expect(readFileSync(versionsPath, "utf8")).toBe(before);
		expect(output).toContain(`\t"99.99.99": "${minAppVersion}"`);
	});
});
