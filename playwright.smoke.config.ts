import { defineObsidianConfig } from "obsidian-e2e-toolkit";

export default defineObsidianConfig({
	testDir: "./e2e",
	testMatch: "smoke.spec.ts",
	fullyParallel: false,
	workers: 1,
	timeout: 90_000,
	reporter: "list",
});
