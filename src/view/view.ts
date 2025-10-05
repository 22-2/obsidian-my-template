import { ItemView, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_BROWSER } from "src/utils/constants";
import { mount, unmount } from "svelte";
import type NobitPlugin from "../main";
import AppComponent from "./App.svelte";

export class BrowserView extends ItemView {
	component: ReturnType<typeof mount> | null = null;
	plugin: NobitPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: NobitPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_BROWSER;
	}

	getDisplayText() {
		return "Browser View";
	}

	async onOpen() {
		this.component = mount(AppComponent, {
			target: this.contentEl,
			props: {},
		});
	}

	async onClose() {
		this.component && unmount(this.component);
	}
}
