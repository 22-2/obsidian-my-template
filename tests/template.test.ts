import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, it } from "vitest";

const rootDir = process.cwd();

function readJson(relativePath: string): Record<string, unknown> {
	return JSON.parse(readFileSync(resolve(rootDir, relativePath), "utf8"));
}

function readJsonAt(root: string, relativePath: string): Record<string, unknown> {
	return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

describe("template release invariants", () => {
	it("keeps package and manifest versions aligned", () => {
		const packageJson = readJson("package.json");
		const manifest = readJson("manifest.json");

		assert.equal(manifest.version, packageJson.version);
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

		assert.equal(readFileSync(versionsPath, "utf8"), before);
		assert.ok(output.includes(`\t"99.99.99": "${minAppVersion}"`));
	});

	it("initializes project names with arguments with and without a separator", () => {
		for (const prefix of [[], ["--"]]) {
			const temporaryRoot = mkdtempSync(join(tmpdir(), "obsidian-template-"));
			try {
				for (const relativePath of ["manifest.json", "package.json", "versions.json"]) {
					cpSync(resolve(rootDir, relativePath), join(temporaryRoot, relativePath));
				}
				cpSync(resolve(rootDir, "src"), join(temporaryRoot, "src"), { recursive: true });

				execFileSync(
					process.execPath,
					[
						"scripts/setup-template.mjs",
						...prefix,
						"--root",
						temporaryRoot,
						"--name",
						"Example Plugin",
						"--id",
						"example-plugin",
					],
					{ cwd: rootDir, encoding: "utf8" },
				);

				const manifest = readJsonAt(temporaryRoot, "manifest.json");
				assert.equal(manifest.id, "example-plugin");
				assert.equal(manifest.name, "Example Plugin");
				assert.equal(readJsonAt(temporaryRoot, "package.json").name, "obsidian-example-plugin");
				assert.ok(readFileSync(join(temporaryRoot, "src/main.ts"), "utf8").includes("class ExamplePlugin extends Plugin"));
				assert.ok(readFileSync(join(temporaryRoot, "src/settings.ts"), "utf8").includes("export interface ExamplePluginSettings"));
				assert.equal(
					readFileSync(join(temporaryRoot, "versions.json"), "utf8"),
					readFileSync(resolve(rootDir, "versions.json"), "utf8"),
				);
			} finally {
				rmSync(temporaryRoot, { recursive: true, force: true });
			}
		}
	});
});
