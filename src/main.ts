import { Plugin } from "obsidian";
import log, { LogLevels } from "consola";
// Import the stylesheet so Vite emits it beside main.js for GitHub Releases.
import "../styles.css";
import { type MyPluginSettings, MyPluginSettingTab, DEFAULT_SETTINGS } from "./settings";

const logger = log.withTag("MyPlugin");

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MyPluginSettingTab(this));
		this.initializeLogger();
	}

	onunload() {
		logger.debug("Plugin unloaded");
	}

	initializeLogger(): void {
		logger.level = this.settings.showLog ? LogLevels.debug : LogLevels.error;
		logger.debug("debug mode enabled");
	}

	async loadSettings() {
		// Merge defaults so settings added in a later template revision remain usable.
		const savedSettings = (await this.loadData()) as Partial<MyPluginSettings> | null;
		this.settings = { ...DEFAULT_SETTINGS, ...savedSettings };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
