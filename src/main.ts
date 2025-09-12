import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS } from "./utils/constants";
import { DirectLogger } from "./utils/logging";
import { MyPluginSettings, MyPluginSettingTab } from "./settings";
import { SvelteView, VIEW_TYPE } from "./view/view";

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings = DEFAULT_SETTINGS;
	logger!: DirectLogger;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MyPluginSettingTab(this));
		this.initializeLogger();

		this.registerView(VIEW_TYPE, (leaf) => new SvelteView(leaf, this));

		this.addRibbonIcon("dice", "Activate svelte view", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-svelte-view",
			name: "Open Svelte View",
			callback: () => {
				this.activateView();
			},
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
		this.logger.debug("Plugin unloaded");
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);

		await this.app.workspace.getRightLeaf(false)?.setViewState({
			type: VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE)[0]
		);
	}

	initializeLogger(): void {
		this.logger = new DirectLogger({
			level: this.settings.logLevel,
			name: "MyPlugin",
		});
		this.logger.debug("debug mode enabled");
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
