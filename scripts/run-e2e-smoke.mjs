import { spawn } from "node:child_process";
import process from "node:process";

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const isWindows = process.platform === "win32";
const runner = spawn(
	isWindows ? "pnpm.cmd" : "pnpm",
	[
		"dlx",
		"offstage-windows@0.1.2",
		"playwright",
		"test",
		"--config",
		"playwright.smoke.config.ts",
	],
	{
		env,
		stdio: "inherit",
		windowsHide: true,
		shell: isWindows,
	},
);

runner.on("error", (error) => {
	console.error("Failed to start the Obsidian E2E smoke test.", error);
	process.exitCode = 1;
});

runner.on("exit", (code, signal) => {
	process.exitCode = code ?? (signal ? 1 : 0);
});
