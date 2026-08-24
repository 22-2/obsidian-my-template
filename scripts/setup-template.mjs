import { readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { applyEdits, modify, parse } from "jsonc-parser";

const options = parseArguments(process.argv.slice(2));
const rootDir = resolve(options.root ?? process.cwd());
const manifestPath = join(rootDir, "manifest.json");
const packagePath = join(rootDir, "package.json");

const manifest = await readJson(manifestPath);
const packageJson = await readJson(packagePath);
const answers = await resolveAnswers(options, manifest, packageJson);

// JSONC targeted edits keep the template's existing formatting while changing
// only the project-specific fields that are meant to be initialized.
await updateJsonField(manifestPath, ["id"], answers.pluginId, options.dryRun);
await updateJsonField(manifestPath, ["name"], answers.displayName, options.dryRun);
await updateJsonField(packagePath, ["name"], answers.packageName, options.dryRun);

const identifierReplacements = [
	// The template ships with MyBrowserLikeHistory* identifiers; also keep the
	// legacy MyPlugin* mappings so older checkouts remain renamable.
	["MyBrowserLikeHistorySettings", `${answers.className}Settings`],
	["MyBrowserLikeHistorySettingTab", `${answers.className}SettingTab`],
	["MyBrowserLikeHistory", answers.className],
	["MyPluginSettings", `${answers.className}Settings`],
	["MyPluginSettingTab", `${answers.className}SettingTab`],
	["MyPlugin", answers.className],
];

for (const relativePath of ["src/main.ts", "src/settings.ts"]) {
	const filePath = join(rootDir, relativePath);
	const source = await readFile(filePath, "utf8");
	const nextSource = identifierReplacements.reduce(
		(current, [from, to]) => current.replaceAll(from, to),
		source,
	);

	if (nextSource !== source) {
		if (!options.dryRun) {
			await writeFile(filePath, nextSource);
		}
		console.log(`${options.dryRun ? "Would update" : "Updated"} ${relativePath}`);
	}
}

console.log(
	`${options.dryRun ? "Would initialize" : "Initialized"} ${answers.displayName} (${answers.pluginId}).`,
);

async function resolveAnswers(cliOptions, manifestValue, packageValue) {
	const defaults = {
		displayName: typeof manifestValue.name === "string" ? manifestValue.name : "My New Plugin",
		pluginId: typeof manifestValue.id === "string" ? manifestValue.id : "my-new-plugin",
		packageName:
			typeof packageValue.name === "string" ? packageValue.name : "obsidian-my-new-plugin",
	};

	if (cliOptions.name || cliOptions.id || cliOptions.className || cliOptions.packageName) {
		const displayName = cliOptions.name ?? defaults.displayName;
		const pluginId = cliOptions.id ?? toKebabCase(displayName);
		return validateAnswers({
			displayName,
			pluginId,
			packageName: cliOptions.packageName ?? `obsidian-${pluginId}`,
			className: cliOptions.className ?? toPascalCase(pluginId),
		});
	}

	if (!input.isTTY || !output.isTTY) {
		throw new Error("Use --name to initialize the template in a non-interactive shell.");
	}

	const prompt = createInterface({ input, output });
	try {
		const displayName =
			(await prompt.question(`Plugin display name (${defaults.displayName}): `)).trim() ||
			defaults.displayName;
		const pluginId =
			(await prompt.question(`Plugin ID (${toKebabCase(displayName)}): `)).trim() ||
			toKebabCase(displayName);
		const className =
			(await prompt.question(`TypeScript class name (${toPascalCase(pluginId)}): `)).trim() ||
			toPascalCase(pluginId);

		return validateAnswers({
			displayName,
			pluginId,
			packageName: `obsidian-${pluginId}`,
			className,
		});
	} finally {
		prompt.close();
	}
}

function validateAnswers(answers) {
	if (!answers.displayName.trim()) {
		throw new Error("The plugin display name cannot be empty.");
	}
	if (!/^[a-z0-9](?:[a-z0-9-_]*[a-z0-9])?$/.test(answers.pluginId)) {
		throw new Error(
			"The plugin ID must contain lowercase letters, numbers, hyphens, or underscores.",
		);
	}
	if (!/^[a-z0-9][a-z0-9._-]*$/.test(answers.packageName)) {
		throw new Error("The package name must be a lowercase npm package name.");
	}
	if (!/^[A-Z][A-Za-z0-9]*$/.test(answers.className)) {
		throw new Error("The class name must be a PascalCase TypeScript identifier.");
	}
	return answers;
}

function toKebabCase(value) {
	return value
		.trim()
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/[^A-Za-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();
}

function toPascalCase(value) {
	const identifier = value
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean)
		.map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
		.join("");

	return /^[A-Za-z]/.test(identifier) ? identifier : `Plugin${identifier}`;
}

async function readJson(filePath) {
	const source = await readFile(filePath, "utf8");
	const errors = [];
	const value = parse(source, errors);
	if (errors.length > 0 || value === null || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${filePath} must contain a valid top-level object.`);
	}
	return value;
}

async function updateJsonField(filePath, path, value, dryRun) {
	const source = await readFile(filePath, "utf8");
	const edits = modify(source, path, value, {});
	const nextSource = applyEdits(source, edits);
	if (nextSource === source) {
		return;
	}
	if (!dryRun) {
		await writeFile(filePath, nextSource);
	}
	console.log(`${dryRun ? "Would update" : "Updated"} ${basename(filePath)}.${path.join(".")}`);
}

function parseArguments(argumentsList) {
	const parsed = {};
	for (let index = 0; index < argumentsList.length; index += 1) {
		const argument = argumentsList[index];
		if (argument === "--dry-run") {
			parsed.dryRun = true;
			continue;
		}
		if (
			argument === "--root" ||
			argument === "--name" ||
			argument === "--id" ||
			argument === "--class-name" ||
			argument === "--package-name"
		) {
			const value = argumentsList[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error(`${argument} requires a value.`);
			}
			const key = {
				"--root": "root",
				"--name": "name",
				"--id": "id",
				"--class-name": "className",
				"--package-name": "packageName",
			}[argument];
			parsed[key] = value;
			index += 1;
			continue;
		}
		throw new Error(`Unknown argument: ${argument}`);
	}

	return parsed;
}
