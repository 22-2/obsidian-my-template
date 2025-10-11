import { PluginSettingTab, Setting } from "obsidian";
import type MyPlugin from "./main";

export interface ISettings {
	showLogger: boolean;
}
export class MyPluginSettingTab extends PluginSettingTab {
	constructor(public plugin: MyPlugin) {
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
						this.plugin.configureLogger();
					});
			});
	}
}
