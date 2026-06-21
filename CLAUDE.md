# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

Vite ベースのプロジェクトです（旧 Create React App から移行済み）。`"type": "module"` のため設定ファイルは `.cjs` 拡張子を使います（`postcss.config.cjs`, `tailwind.config.cjs`）。

- `npm run dev`（= `npm start`）— 開発サーバーを http://localhost:3000 で起動
- `npm run build` — `tsc --noEmit` で型チェック後、Vite で `dist/` へ本番ビルド
- `npm run preview` — ビルド済み `dist/` をローカル配信して確認
- `npm test` — Vitest をウォッチモードで実行（jsdom 環境）
- `npx vitest run` — テストを一度だけ実行（CI 用）
- `npx vitest run src/App.test.tsx` — 単一テストファイルの実行

独立した lint コマンドはありません（CRA の ESLint 統合は移行時に外しています）。型チェックは `tsc --noEmit`（`npm run build` に内包）で行います。

デプロイは Vercel。`vercel.json` で `framework: vite` / `outputDirectory: dist` を固定しています。

## アーキテクチャ

PDF をレビューし、選択したテキストにコメントを付けるためのクライアント完結型シングルページ React アプリです。バックエンドは存在せず、すべての状態はブラウザ内に保持されます。

### データフロー（状態は `src/App.tsx` に集約）

`App` が単一の信頼できる情報源（single source of truth）です。3 つの状態を保持し、下位コンポーネントへ渡します。

- `pdfFile` — アップロードされた `File`。null の間は `PDFUploader` を表示し、設定されると 2 ペインのビューア/コメントレイアウトを描画します。
- `selectedText` — 現在ハイライトされている PDF テキストの `{ text, pageNumber, position }`。PDF 上の mouseup で設定され、コメント保存時にクリアされます。
- `comments` — `{ text, pageNumber, content }` の配列。変更のたびに走る `useEffect` で `localStorage` のキー `pdfComments` に永続化され、マウント時に復元されます。

レイアウト: 左 2/3 ペインが `PDFViewer`、右 1/3 ペインが `CommentList`。

### コンポーネント

- `PDFViewer.tsx` — `react-pdf`（`Document`/`Page`）で 1 ページずつ描画します。テキスト選択は `onMouseUp` → `window.getSelection()` → `onTextSelection` コールバックで `App` へ伝播します。ページナビゲーション状態（`pageNumber`, `numPages`）と ArrowLeft/ArrowRight によるページ送りを保持します。**textarea にフォーカスがある場合はキーボードのページ送りを意図的に無効化**しています（コメント入力中にページが切り替わらないようにするため）。ナビゲーション UI として `PDFPagination` を描画します。
- `components/PDFPagination.tsx` — Previous/Next ボタンと「ページジャンプ」入力フォーム。
- `CommentList.tsx` — すべてのコメントを描画します。**コメントは個別の React 要素ではなく、1 本の Markdown 文字列として** `ReactMarkdown` に渡されます。各コメントは `## 見出し (p.N)` ブロックと `[Delete](#index)` リンクになり、リンクの `href` の index をカスタム `a` レンダラーで解析して `onDeleteComment` を呼びます。文字列は 2 種類生成されます: `renderComments`（Delete リンク付き・表示用）と `renderCommentsForCopy`（リンクなし・「Copy All」でのクリップボードコピー用）。**Page Offset** コントロールもここが持ちます: 各コメントの `pageNumber` から差し引くローカルな数値で、表示/コピーされるページ参照を文書の印刷上のページ番号に合わせます。
- `CommentUI.tsx` — コメント用 textarea と Save/Clear ボタン。
- `PDFUploader.tsx` — `react-dropzone` によるドラッグ&ドロップ / ファイル選択。

### 注意すべき点

- `react-pdf` の pdf.js ワーカーと cMaps は、`PDFViewer.tsx` 内でハードコードされた unpkg CDN URL（`pdfjs-dist@4.4.168` にピン留め）から読み込まれます。このバージョンはインストール済みの `react-pdf` と互換性を保つ必要があります。
- コメント/ページの型（`{ text, pageNumber, content }` および `selectedText` の形）は、共通モジュールから共有されず、`App.tsx`・`CommentList.tsx`・`PDFViewer.tsx` にインラインの interface として重複定義されています。
- スタイリングは Tailwind（`tailwind.config.cjs`、`postcss.config.cjs` で処理）。グローバルスタイルは `src/globals.css` と `src/index.css`。
- エントリは Vite 規約に従いリポジトリルートの `index.html`（`<script type="module" src="/src/index.tsx">`）。`public/` 配下の静的ファイルはルート（`/favicon.ico` 等）から配信されます。
- テストは Vitest + jsdom。グローバル API（`test`/`expect`）は `vite.config.ts` の `test.globals: true` と `tsconfig.json` の `types: ["vitest/globals", ...]` で有効化。セットアップは `src/setupTests.ts`（`@testing-library/jest-dom`）。`App.test.tsx` は PDF 未読込の初期画面を検証するため `react-pdf`/`canvas` に依存しません。
