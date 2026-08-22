import { readFile, writeFile } from "node:fs/promises";
import { applyEdits, modify, parse } from "jsonc-parser";

const version = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (!version) {
	throw new Error("A release version is required.");
}

const manifestPath = new URL("../manifest.json", import.meta.url);
const versionsPath = new URL("../versions.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const versionsText = await readFile(versionsPath, "utf8");

if (typeof manifest.minAppVersion !== "string") {
	throw new Error("manifest.json must define minAppVersion as a string.");
}

const parseErrors = [];
const parsedVersions = parse(versionsText, parseErrors);

if (
	parseErrors.length > 0 ||
	parsedVersions === null ||
	Array.isArray(parsedVersions) ||
	typeof parsedVersions !== "object"
) {
	throw new Error("versions.json must contain a valid top-level object.");
}

// jsonc-parser returns a targeted edit, so applying it keeps unrelated
// whitespace and line endings intact instead of re-serializing the file.
const formattingOptions = detectFormattingOptions(versionsText);
const edits = modify(
	versionsText,
	[version],
	manifest.minAppVersion,
	formattingOptions ? { formattingOptions } : {},
);
const nextVersionsText = applyEdits(versionsText, edits);

if (dryRun) {
	process.stdout.write(nextVersionsText);
} else {
	await writeFile(versionsPath, nextVersionsText);
}

function detectFormattingOptions(source) {
	if (!source.includes("\n") && !source.includes("\r")) {
		// Let jsonc-parser keep compact JSON compact when there is no layout to
		// infer from the existing properties.
		return undefined;
	}

	const propertyIndent = source.match(/^(?<indent>[\t ]+)"(?:\\.|[^"\\\r\n])*"[ \t]*:/m)?.groups
		?.indent;

	return {
		insertSpaces: propertyIndent ? !propertyIndent.includes("\t") : false,
		tabSize: propertyIndent?.includes("\t") ? 1 : propertyIndent?.length || 1,
		eol: source.includes("\r\n") ? "\r\n" : "\n",
		insertFinalNewline: source.endsWith("\n") || source.endsWith("\r"),
	};
}
