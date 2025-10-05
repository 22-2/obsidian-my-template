import log from "loglevel";
import manifest from "../../manifest.json" with { type: "json" };
import { type NobitPluginSettings } from "../settings";

export const DEBUG_MODE = Boolean(
	(typeof process !== "undefined" &&
		process.env.NODE_ENV === "development") ||
		process.env.CI
);

log.debug("ENABLE_LOGGER", DEBUG_MODE);

export const DEFAULT_SETTINGS: NobitPluginSettings = {
	showLogger: DEBUG_MODE,
};

export const APP_NAME = manifest.name;

export const VIEW_TYPE_BROWSER = "browser-view";
