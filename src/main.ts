import log from "loglevel";
import { Plugin } from "obsidian";
import { type NobitPluginSettings, NobitSettingTab } from "./settings";
import { DEFAULT_SETTINGS, VIEW_TYPE_BROWSER } from "./utils/constants";
import { toggleLoggerBy } from "./utils/logger";
import { activateView } from "./utils/obsidian";
import { BrowserView } from "./view/view";

export const logger = log.getLogger("nobit.main");

export default class NobitPlugin extends Plugin {
	settings: NobitPluginSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();
		this.configureLogging();
		this.addSettingTab(new NobitSettingTab(this));

		this.registerView(
			VIEW_TYPE_BROWSER,
			(leaf) => new BrowserView(leaf, this)
		);

		this.addRibbonIcon("dice", "Activate browser view", () => {
			this.activateView();
		});

		logger.debug("Plugin loaded");
	}

	onunload() {
		logger.debug("Plugin unloaded");
	}

	private activateView() {
		activateView(this.app.workspace.getLeaf.bind(this.app.workspace), {
			type: VIEW_TYPE_BROWSER,
		});
	}

	private configureLogging(): void {
		toggleLoggerBy(this.settings.showLogger ? "DEBUG" : "ERROR");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
