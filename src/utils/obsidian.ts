import type { UViewState, Workspace, WorkspaceLeaf } from "obsidian";

export async function activateView<T = any, U = any>(
	getLeaf: Workspace["getLeaf"],
	viewState: UViewState,
	eState?: U
): Promise<T> {
	const leaf: WorkspaceLeaf = getLeaf("tab");

	if (viewState) {
		await leaf.setViewState(viewState);
	}
	if (eState) {
		leaf.setEphemeralState(eState);
	}

	return leaf.view as T;
}
