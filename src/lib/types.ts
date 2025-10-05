// TODO: zodに置き換える

// packages/libch/src/types.ts

export interface Post {
	resNum: number;

	authorName: string;
	mail: string;
	authorId: string;
	/**
	 * パーサーによってアンカー(>>1)が<a>タグに変換済みのHTML文字列。
	 * コンポーネント側ではこれをそのまま {@html} で表示します。
	 */
	content: string;
	date: Date;
	/** このレスが参照しているレス番号の配列 (例: [10, 25]) */
	references: number[];
	/** このレスから返信されている（被参照）レス番号の配列 (例: [100, 123]) */
	replies: number[];
	hasImage: boolean;
	hasExternalLink: boolean;
	/** この投稿のIDがスレッド内で書き込んだ総数 */
	postIdCount: number;
	/** この投稿のIDが書き込んだレス番号の配列（自分自身も含む） */
	siblingPostNumbers: number[];
	/** この投稿に含まれる画像のURLの配列 */
	imageUrls?: string[];
}

export interface ThreadFilters {
	popular: boolean;
	image: boolean;
	video: boolean;
	external: boolean;
	internal: boolean;
	searchText: string;
}

export interface Thread {
	title: string;
	posts: Post[];
	url: string;
}

export interface SubjectItem {
	id: string; // スレッドID (unixtime)
	title: string;
	resCount: number;
}

export interface Board {
	name: string;
	url: string;
}

export interface BBSMenuCategory {
	name: string;
	boards: Board[];
}

export type BBSMenu = BBSMenuCategory[];

// --- 書き込み関連の型 ---
export interface PostData {
	name: string;
	mail: string;
	content: string;
}

export type PostResult =
	| SuccessPostResult
	| ErrorPostResult
	| ConfirmationPostResult;

export interface SuccessPostResult {
	kind: "success";
	message: string;
}

export interface ErrorPostResult {
	kind: "error";
	message: string;
}

export interface ConfirmationPostResult {
	kind: "confirmation";
	/** 確認画面のHTMLコンテンツ */
	html: string;
	/** 再投稿に必要なフォームデータ */
	formData: Record<string, string>;
}
