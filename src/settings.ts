import { PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import type MyPlugin from "./main";

export interface MyPluginSettings {
	showLog: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	showLog: false,
};

export class MyPluginSettingTab extends PluginSettingTab {
	constructor(public plugin: MyPlugin) {
		super(plugin.app, plugin);
	}

	// Declarative settings keep this tab searchable and let Obsidian manage its
	// rendering lifecycle. See the official migration and settings references:
	// https://docs.obsidian.md/plugins/guides/migrate-declarative-settings
	// https://docs.obsidian.md/Plugins/User+interface/Settings
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: "Show debug messages",
				desc: "Enable or disable debug messages.",
				// A render callback is needed here because changing the setting also
				// changes the logger level, which is a side effect beyond persistence.
				render: (setting) => {
					setting.addToggle((toggle) => {
						toggle.setValue(this.plugin.settings.showLog).onChange(async (value) => {
							this.plugin.settings.showLog = value;
							this.plugin.initializeLogger();
							await this.plugin.saveSettings();
						});
					});
				},
			},
		];
	}
}
