# MarkDownEditor

**Windows 用の軽快なポータブル Markdown ビューアー & エディター。**
`.md` ファイルをダブルクリックするだけで開きます — インストール不要。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.md) · [English](README.en.md) · **日本語** · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

![プレビュー — ライトテーマ](docs/images/preview-light.png)

## 主な特長

- **ポータブル** — 解凍して実行するだけ。WebView2 ランタイムを同梱し、設定・キャッシュは exe の隣に保存されるため、システムに痕跡を残しません。
- **自動アップデート** — 起動時に GitHub リリースを静かに確認します。新しいバージョンがあるとタイトル横のバージョン表示の右に赤い点が付き、バージョンをクリックして開くメニューの「新しいバージョンがあります」から、アプリ内で進行状況を見ながらアップデートできます。設定とセッションは保持されます。（自動アップデート — 匿名のバージョン確認と、実行時のみのリリースのダウンロード — がアプリ唯一のネットワークアクセスで、ドキュメントや個人情報は一切送信されません。）
- **ウィンドウは 1 つ、ドキュメントはタブで** — すべてのファイルが 1 つのウィンドウのタブとして開きます（ミューテックス + 名前付きパイプによる単一インスタンス）。タブはドラッグ & ドロップで並べ替え、`Ctrl+Tab` で切り替え。
- **すべてのリンクが動作** — `.md` リンクは新しいタブ、Web リンクはブラウザー、フォルダーはエクスプローラー、その他のドキュメントは既定のアプリで開きます。`doc.md#セクション` 形式のドキュメント間アンカーにも対応。
- **戻る / 進む** — ツールバーのボタン、`Alt+←`/`Alt+→`、またはマウスの第 4・第 5 ボタンで。
- **GitHub スタイルのレンダリング** — 表、コードハイライト（オフライン）、**mermaid ダイアグラム**（オフライン、テーマ連動）。
- **目次サイドバー** — 現在のセクションを追従して強調表示（scroll-spy）。
- **編集 ↔ プレビュー** — `Ctrl+E` で切り替え、スクロール位置は両モード間で同期。
- **書式バー** — 編集モードで表示：太字・見出し・リスト・チェックボックス・引用・コード・リンク・表・区切り線をワンクリックで。**Markdown 記法を知らなくても OK**（すべて `Ctrl+Z` で取り消し可能）。
- **右クリックメニュー** — プレビュー（コピー・リンクを開く・リンクのアドレスをコピー・画像を表示・検索）、エディター（切り取り / コピー / 貼り付け / すべて選択）。
- **検索 / 置換** — `Ctrl+F` はプレビュー（全一致ハイライト）と編集の両方で動作。`Ctrl+H` の置換は編集モードで。
- **PDF エクスポート** — 保存ボタン横の `📄`、または `Ctrl+P`。常にライトテーマで出力。
- **クリップボードから画像を貼り付け** — ドキュメント横の `images/` フォルダーに保存され、リンクが自動挿入されます。
- **外部変更の自動反映** — 他のプログラム（IDE・エディター）が保存すると開いているタブが更新されます。未保存の編集が黙って上書きされることはありません。
- **自動バックアップ & クラッシュ復元** — 未保存の変更を 30 秒ごとにスナップショットし、次回起動時に復元を提案します。
- **セッション復元** — ファイルなしで起動すると、前回開いていたタブを再度開きます。最近使ったファイルは 🕘 ボタンから。
- **韓国語エンコーディング検出** — BOM なしの CP949/EUC-KR ファイルも UTF-8 と同様に正しく開きます。
- **ダーク / ライトテーマ** — タイトルバーの `🌙`/`☀` ボタンで切り替え、次回起動時も記憶。Windows のタイトルバーも連動します。
- **UI は 10 言語対応** — 한국어、English、日本語、简体中文、繁體中文、Español、Français、Deutsch、Русский、Português。既定では OS の言語に従い、タイトルバーの `🌐` ボタンでいつでも変更できます。
- **メモ帳風のコンパクトな外観** — タブとツールはカスタムタイトルバーに統合（空白部分をドラッグで移動、ダブルクリックで最大化）。

![言語メニュー](docs/images/menu.png)

## はじめに

1. Releases から `MarkDownEditor-standalone.zip` をダウンロードし、**好きな場所に解凍**します。
2. `MarkDownEditor.exe` を実行します。インストーラーはありません。
3. （任意）`.md` の既定のアプリに設定：`.md` ファイルを右クリック → *プログラムから開く* → *別のアプリを選択* → `MarkDownEditor.exe` を選び、*常に使う* にチェック。

> **SmartScreen について** — バイナリはコード署名されていないため、初回実行時に Windows が「発行元不明」の警告を表示することがあります。*詳細情報 → 実行* を選ぶか、下記の手順でソースからビルドしてください。

### 動作環境

- Windows 10 / 11（64 ビット）
- WebView2 のインストールは不要 — 固定バージョンのランタイムを同梱しています。（同梱なしのビルドはシステムの Evergreen ランタイムを自動使用。）

## キーボードショートカット

| キー | 動作 |
|------|------|
| `Ctrl+O` | 開く（複数選択可） |
| `Ctrl+N` | 新規ドキュメントタブ |
| `Ctrl+S` | 保存 |
| `Ctrl+P` | PDF としてエクスポート |
| `Ctrl+E` | 編集 / プレビュー切替 |
| `Ctrl+F` / `Ctrl+H` | 検索 / 置換 |
| `Ctrl+B` / `Ctrl+I` | 太字 / 斜体（編集モード、トグル） |
| `Ctrl+K` | リンク挿入（編集モード — アドレス部分が選択された状態で挿入） |
| `Tab` / `Shift+Tab` | インデント / インデント解除（複数行対応） |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | 次 / 前のタブ |
| `Ctrl+W` | タブを閉じる |
| `Alt+←` / `Alt+→` | 戻る / 進む |

## ソースからビルド

```powershell
cd src
dotnet publish -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

出力：`src/bin/Release/net9.0-windows/win-x64/publish/MarkDownEditor.exe`
exe の隣に `web/` フォルダー（および任意で WebView2 Fixed Version Runtime を `Runtime/` として）を置いてください。

### アーキテクチャ概要

C#（WPF）側はファイル I/O・単一インスタンスのパイプ・ウィンドウクロームを担当し、Web 側（単一の WebView2 上のバニラ JS）がすべてのドキュメントバッファーとタブ状態を所有します。両者は `postMessage` のみで通信します。レンダリングには marked + highlight.js + mermaid を使用し、すべてオフライン用に同梱されています。全機能の詳しい紹介は [README.md](README.md)（韓国語）または [README.en.md](README.en.md)（英語）をご覧ください。

## フィードバック

バグ報告や機能のリクエストは [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose) へどうぞ。アプリ内でタイトル横のバージョン表示をクリックしても移動できます（バグ報告フォームには現在のバージョンが自動入力されます）。

## ライセンス

MIT — [LICENSE](LICENSE) を参照。同梱のサードパーティコンポーネントは
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) に記載されています（mermaid バンドルには文書化された小さなローカルパッチが含まれます）。
