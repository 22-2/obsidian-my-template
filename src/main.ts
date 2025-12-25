import { Plugin } from "obsidian";
import log from "loglevel";
import {
	MyPluginSettings,
	MyPluginSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";

const logger = log.getLogger("MyPlugin");

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MyPluginSettingTab(this));
		this.initializeLogger();
	}

	onunload() {
		this.logger.debug("Plugin unloaded");
	}

	initializeLogger(): void {
		toggleLoggerBy(
			this.settings.showLog ? "debug" : "warn",
			(name) => name === "MyPlugin"
		);
		logger.debug("debug mode enabled");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export function toggleLoggerBy(
	level: log.LogLevelDesc,
	filter: (name: string) => boolean = () => true
): void {
	Object.values(log.getLoggers())
		// @ts-expect-error
		.filter((logger) => filter(logger.name))
		.forEach((logger) => {
			logger.setLevel(level);
		});
}
