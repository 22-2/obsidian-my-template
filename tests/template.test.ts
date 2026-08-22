import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
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

	it("initializes project names across the template files", () => {
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
					"--root",
					temporaryRoot,
					"--name",
					"Example Plugin",
					"--id",
					"example-plugin",
				],
				{ cwd: rootDir, encoding: "utf8" },
			);

			expect(readJsonAt(temporaryRoot, "manifest.json")).toMatchObject({
				id: "example-plugin",
				name: "Example Plugin",
			});
			expect(readJsonAt(temporaryRoot, "package.json").name).toBe("obsidian-example-plugin");
			expect(readFileSync(join(temporaryRoot, "src/main.ts"), "utf8")).toContain(
				"class ExamplePlugin extends Plugin",
			);
			expect(readFileSync(join(temporaryRoot, "src/settings.ts"), "utf8")).toContain(
				"export interface ExamplePluginSettings",
			);
			expect(readFileSync(join(temporaryRoot, "versions.json"), "utf8")).toBe(
				readFileSync(resolve(rootDir, "versions.json"), "utf8"),
			);
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});
});

function readJsonAt(root: string, relativePath: string): Record<string, unknown> {
	return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}
