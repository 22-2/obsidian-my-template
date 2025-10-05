import { PluginSettingTab, Setting } from "obsidian";
import type NobitPlugin from "./main";

export interface NobitPluginSettings {
	showLogger: boolean;
}
export class NobitSettingTab extends PluginSettingTab {
	constructor(public plugin: NobitPlugin) {
		super(plugin.app, plugin);
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl).setName("Plugin Settings").setHeading();

		new Setting(this.containerEl)
			.setName("Show Debug Messages")
			.setDesc("Enable or disable debug messages")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.showLogger)
					.onChange(async (val) => {
						this.plugin.settings.showLogger = val;
						await this.plugin.saveSettings();
						this.plugin.initializeLogger();
					});
			});
	}
}
