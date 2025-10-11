import manifest from "../../manifest.json";
import type { ISettings } from "../settings";

export const DEFAULT_SETTINGS: ISettings = {
	showLogger: false,
};

export const APP_NAME = manifest.name || "MyPlugin";
