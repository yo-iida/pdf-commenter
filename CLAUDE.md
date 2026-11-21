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

デプロイは Vercel。`vercel.json` で `framework: vite` / `outputDirectory: dist` を固定しています。Node.js のバージョンは `package.json` の `engines.node`（24.x）で指定しており、Vercel のプロジェクト設定より優先されます。

CI は GitHub Actions（`.github/workflows/ci.yml`）。main への push と PR で `tsc --noEmit` → `vitest run` → `vite build` を実行します（Node は `engines.node` に合わせます）。Vercel のビルドではテストは実行されません。

## アーキテクチャ

PDF をレビューし、選択したテキストにコメントを付けるためのクライアント完結型シングルページ React アプリです。バックエンドは存在せず、すべての状態はブラウザ内に保持されます。

### データフロー

状態は 2 層に分かれています。

- `App.tsx` — `pdfFile`（開いている `File`）だけを持ちます。null の間は `PDFUploader` を表示し、設定されると `ReviewWorkspace` を描画します。`ReviewWorkspace` には `key={documentKey(pdfFile)}` を渡しているので、別の PDF を開くとコンポーネントごと作り直され、その PDF の状態が読み込み直されます。
- `ReviewWorkspace.tsx` — 1 つの PDF のレビュー画面で、その PDF の状態の信頼できる情報源（single source of truth）です。
  - `comments` — `{ text, pageNumber, content }` の配列
  - `pageOffset` — 表示/コピーするページ番号から差し引く数値
  - `selectedText` — 現在選択されている PDF テキスト `{ text, pageNumber }`。PDF 上の mouseup で設定され、コメント保存時にクリアされます
  - `legacyComments` — PDF ごとの保存に移行する前の旧データ（下記）

**永続化（`src/storage.ts`）**: `comments` と `pageOffset` は PDF ごとに `localStorage` のキー `pdfReview:<ファイル名>:<サイズ>:<lastModified>`（`documentKey`）へ `{ comments, pageOffset }` として保存されます。`useState` の遅延初期化で復元し、変更のたびに走る `useEffect` で保存します。**復元を別の `useEffect` に分けないでください**（StrictMode の effect 二重実行で保存側が先に空の状態を書き込み、データが消えます）。空になったドキュメントのキーは削除されます。

**旧データ**: 以前は全 PDF のコメントを単一キー `pdfComments` に保存していました。このキーにデータがあると、PDF を開いたときにバナーが表示され、「Import into this PDF」で開いている PDF に取り込むか「Discard」で破棄できます。どちらかを選ぶまで旧データは残ります（自動では移行しません）。

コメントの保存（`handleCommentSave`）は、選択テキストがない場合や本文が空の場合に `false` を返します。`CommentUI` は `true` が返ったときだけ textarea を空にします。

レイアウト: 上部にファイル名と「Open another PDF」ボタン（`pdfFile` を null に戻してアップロード画面へ戻る）、その下に左 2/3 ペインの `PDFViewer` と右 1/3 ペインの `CommentList`。

### コンポーネント

- `PDFViewer.tsx` — `react-pdf`（`Document`/`Page`）で 1 ページずつ描画します。テキスト選択は `onMouseUp` → `window.getSelection()` → `onTextSelection` コールバックで `ReviewWorkspace` へ伝播します。ページナビゲーション状態（`pageNumber`, `numPages`）と ArrowLeft/ArrowRight によるページ送りを保持します。**textarea・input・select・contenteditable にフォーカスがある間はキーボードのページ送りを意図的に無効化**しています（コメント入力やページジャンプ/Page Offset の入力中に、カーソル移動でページが切り替わらないようにするため）。ナビゲーション UI として `PDFPagination` を描画します。ページの幅は固定せず、スクロール領域の幅を `ResizeObserver`（`useContentWidth`）で測って `Page` の `width` に渡し、ペイン幅に合わせます。縦スクロールバーの出入りで幅が振動しないよう、スクロール領域に `scrollbar-gutter: stable` を指定しています。
- `components/PDFPagination.tsx` — Previous/Next ボタンと「ページジャンプ」入力フォーム。
- `CommentList.tsx` — すべてのコメントを描画します。各コメントは個別の React 要素（`<li>`）で、見出し（選択テキスト + `(p.N)`）はプレーンテキスト、本文（`content`）だけを `ReactMarkdown` で描画し、Delete は通常の `<button>` です（本文中のリンクは普通のリンクとして描画されます）。「Copy All」用には `## 見出し (p.N)` 形式の Markdown 文字列（`renderCommentsForCopy`）を生成してクリップボードにコピーします。「Clear All」は即座には消さず、その場に確認（`role="alertdialog"`、初期フォーカスは Cancel）を出し、「Delete all」で `onClear` を呼びます。**Page Offset** の入力欄もここにあります（値は `ReviewWorkspace` が持つ制御された props で、入力途中の `-` などを扱うため入力文字列は内部の下書き state に保持します）。各コメントの `pageNumber` から差し引き、表示/コピーされるページ参照を文書の印刷上のページ番号に合わせます。
- `CommentUI.tsx` — コメント用 textarea と Save/Clear ボタン。選択テキストがない間、または本文が空の間は Save が無効になります。
- `PDFUploader.tsx` — `react-dropzone` によるドラッグ&ドロップ / ファイル選択。

### 注意すべき点

- `react-pdf` の pdf.js ワーカーは、`PDFViewer.tsx` で `pdfjs-dist/build/pdf.worker.min.mjs?url` を import して Vite で同梱しています（`react-pdf` が依存する `pdfjs-dist` を使うため、API とワーカーのバージョンが常に一致します。pdf.js はバージョンが違うと PDF の読み込みを拒否します）。cMaps は `pdfjs.version` から組み立てた unpkg CDN の URL から読み込みます。ワーカーの URL をハードコードしないでください。
- 共有する型（`Comment`・`SelectedText`・`TextSelectionHandler`）は `src/types.ts` にまとめています。コンポーネント間で受け渡す型はここに追加し、各ファイルにインラインで重複定義しないでください。
- スタイリングは Tailwind（`tailwind.config.cjs`、`postcss.config.cjs` で処理）。グローバルスタイルは `src/globals.css` と `src/index.css`。
- エントリは Vite 規約に従いリポジトリルートの `index.html`（`<script type="module" src="/src/index.tsx">`）。`public/` 配下の静的ファイルはルート（`/favicon.ico` 等）から配信されます。
- テストは Vitest + jsdom。グローバル API（`test`/`expect`）は `vite.config.ts` の `test.globals: true` と `tsconfig.json` の `types: ["vitest/globals", ...]` で有効化。セットアップは `src/setupTests.ts`（`@testing-library/jest-dom/vitest`）。`App.test.tsx` は `vi.mock('./PDFViewer')` で `react-pdf`/`canvas` への依存を外し、テキスト選択をスタブのボタンで再現しています。`PDFViewer.test.tsx` は `vi.mock('react-pdf')` で `Document`/`Page` をスタブにし、jsdom にないレイアウト（`clientWidth`）と `URL.createObjectURL` を差し替えてページ送りや選択を検証しています。
