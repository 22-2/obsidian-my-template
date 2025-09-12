import { ItemView, WorkspaceLeaf } from "obsidian";
import App from "./App.svelte";
import type MyPlugin from "../main";
import { mount, unmount } from "svelte";

export const VIEW_TYPE = "svelte-view";

export class SvelteView extends ItemView {
	component: App;
	plugin: MyPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText() {
		return "Svelte View";
	}

	async onOpen() {
		this.component = mount(App, {
			target: this.contentEl,
			props: {
				plugin: this.plugin,
			},
		});
	}

	async onClose() {
		unmount(this.component);
	}
}
