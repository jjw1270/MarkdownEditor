# MarkDownEditor

**輕快的 Windows 可攜式 Markdown 檢視器 & 編輯器。**
雙擊 `.md` 檔案即可開啟 — 無需安裝。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.ko.md) · [English](README.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

### ⬇️ [下載 Windows 版](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip) &nbsp;·&nbsp; <sub>.zip，約 331 MB · 解壓縮即可執行 · [查看更新內容](https://github.com/jjw1270/MarkdownEditor/releases/latest)</sub>

![預覽 — 淺色主題](docs/images/preview-light.png)

## 特色

- **可攜式** — 解壓縮即可執行。內建 WebView2 執行階段，設定與快取都保存在 exe 旁邊，不在系統留下任何痕跡。
- **自動更新** — 啟動時靜默檢查 GitHub Releases；有新版本時，標題列版本號右側會出現紅點；點擊版本號 → **有新版本可用**，即可在應用程式內帶進度列完成更新，設定與工作階段全數保留。（自動更新——匿名版本檢查，以及僅在執行更新時下載發行檔案——是本程式唯一的網路存取，絕不傳送任何文件或個人資料。）
- **一個視窗，多個分頁** — 所有檔案都在同一視窗中以分頁開啟（互斥鎖 + 具名管道實現單一執行個體）。分頁可拖曳排序，`Ctrl+Tab` 循環切換。
- **所有連結都可用** — `.md` 連結在新分頁開啟，網頁連結用瀏覽器，資料夾用檔案總管，其他文件用預設應用程式。支援跨文件錨點（`doc.md#章節`）。
- **上一頁 / 下一頁** — 工具列按鈕、`Alt+←`/`Alt+→`，或滑鼠第 4/5 鍵。
- **GitHub 風格渲染** — 表格、程式碼標示（離線）、**mermaid 圖表**（離線、跟隨主題）。
- **目錄側邊欄** — 隨閱讀位置自動標示目前章節（scroll-spy）。
- **編輯 ↔ 預覽** — `Ctrl+E` 切換，兩種模式間捲動位置保持同步。
- **格式列** — 編輯模式下顯示：粗體、標題、清單、核取方塊、引用、程式碼、連結、表格、分隔線，一鍵插入。**不懂 Markdown 語法也能用**（全部可用 `Ctrl+Z` 復原）。
- **右鍵選單** — 預覽區（複製、開啟連結、複製連結位址、檢視圖片、尋找），編輯區（剪下 / 複製 / 貼上 / 全選）。
- **尋找 / 取代** — `Ctrl+F` 在預覽（全部相符標示）和編輯模式下均可用；`Ctrl+H` 在編輯模式下取代。
- **匯出 PDF** — 儲存按鈕旁的 `📄`，或 `Ctrl+P`，一律以淺色主題輸出。
- **從剪貼簿貼上圖片** — 儲存到文件旁的 `images/` 資料夾並自動插入連結。
- **外部修改自動重新載入** — 其他程式（IDE、編輯器）儲存後，已開啟的分頁自動更新；未儲存的編輯絕不會被悄悄覆寫。
- **自動備份 & 當機復原** — 每 30 秒對未儲存的變更做快照，下次啟動時提示復原。
- **工作階段還原** — 不帶檔案啟動時，重新開啟上次的分頁。最近的檔案可從 🕘 按鈕開啟。
- **韓文編碼偵測** — 無 BOM 的 CP949/EUC-KR 檔案與 UTF-8 一樣正常開啟。
- **深色 / 淺色主題** — 標題列 `🌙`/`☀` 按鈕切換，記住上次選擇，Windows 標題列同步變色。
- **介面 10 種語言** — 한국어、English、日本語、简体中文、繁體中文、Español、Français、Deutsch、Русский、Português。預設跟隨系統語言，可隨時在標題列 `🌐` 按鈕中切換。
- **記事本式精簡介面** — 分頁與工具整合在自訂標題列中（拖曳空白區域移動視窗，雙擊最大化）。

![語言選單](docs/images/menu.png)

## 🚀 安裝

沒有安裝程式，不需要系統管理員權限，也不需要任何前置元件。下載、解壓縮、執行，就這三步。

### 步驟 1 — 下載

**⬇️ [MarkDownEditor-standalone.zip](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip)** — 這個連結**永遠指向最新版本**。

| | |
|---|---|
| **檔案大小** | 約 331 MB — 內建完整的 WebView2 執行階段，所以不必再安裝任何東西 |
| **系統需求** | Windows 10 / 11（64 位元）。除此之外別無要求。 |
| **更多** | [所有版本](https://github.com/jjw1270/MarkdownEditor/releases) · [本次更新內容](https://github.com/jjw1270/MarkdownEditor/releases/latest) · [完整變更紀錄](CHANGELOG.md) |

<details>
<summary><b>習慣用終端機？</b> 一段 PowerShell 完成下載、解壓縮與啟動</summary>

```powershell
$dest = "$env:LOCALAPPDATA\Programs\MarkDownEditor"
$zip  = "$env:TEMP\MarkDownEditor-standalone.zip"

Invoke-WebRequest "https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip" -OutFile $zip
Expand-Archive $zip -DestinationPath $dest -Force
Remove-Item $zip

Start-Process "$dest\MarkDownEditor.exe"
```

之後要更新時再執行一次同樣的程式碼即可，也可以直接用下面說明的**應用程式內自動更新**。

</details>

### 步驟 2 — 解壓縮並執行

解壓縮到任何有寫入權限的位置都可以：`C:\Tools\MarkDownEditor`、桌面、USB 隨身碟都行。接著執行 **`MarkDownEditor.exe`**。

資料夾中除了 `MarkDownEditor.exe`，還有 `web/`（介面）、`Runtime/`（內建 WebView2）與 `WebView2Data/`（快取）。把它們放在一起，整個資料夾可以隨意搬移、複製，或放進隨身碟在別台電腦上直接使用。

> **首次執行時跳出的藍色 SmartScreen 視窗是正常的。** 程式未經程式碼簽署，因此 Windows 會顯示「Windows 已保護您的電腦」。點選 **其他資訊 → 仍要執行** 即可，只會出現這一次。
> 如果不想執行未簽署的程式，從原始碼自行建置只需兩道指令 — 見下方 *從原始碼建置*。

### 步驟 3 — 設為 `.md` 的預設應用程式 *(這才是重點)*

設定一次之後，在檔案總管中雙擊任何 Markdown 檔案，都會立刻開啟渲染好的文件。

1. 在檔案總管中**右鍵**任一 `.md` 檔案
2. **開啟方式 → 選擇其他應用程式**
3. 從清單中選擇 `MarkDownEditor.exe` — 若找不到，往下捲動並使用 **在這部電腦上選擇應用程式**
4. 勾選 **一律使用此應用程式開啟 .md 檔案**，然後按 **確定**

`.markdown` 與 `.txt` 也可以用同樣的方式關聯。

### 更新

你不需要再回到這個頁面。應用程式每次啟動都會檢查 GitHub releases，發現新版本時會在標題列版本號右側顯示一個**紅點**。點擊版本號 → **更新**，它就會帶進度列下載、自我替換並重新啟動，你的設定、已開啟的分頁與工作階段都會保留。

### 解除安裝

刪除資料夾就結束了 — 登錄檔、`%AppData%`、「應用程式與功能」清單中都不會留下任何東西。（如果曾設定檔案關聯，下次開啟 `.md` 時 Windows 只會請你重新選擇預設應用程式。）

## 鍵盤快速鍵

| 按鍵 | 動作 |
|------|------|
| `Ctrl+O` | 開啟（支援多選） |
| `Ctrl+N` | 新增文件分頁 |
| `Ctrl+S` | 儲存 |
| `Ctrl+P` | 匯出為 PDF |
| `Ctrl+E` | 編輯 / 預覽切換 |
| `Ctrl+F` / `Ctrl+H` | 尋找 / 取代 |
| `Ctrl+B` / `Ctrl+I` | 粗體 / 斜體（編輯模式，可切換） |
| `Ctrl+K` | 插入連結（編輯模式 — 位址部分處於選取狀態） |
| `Tab` / `Shift+Tab` | 增加 / 減少縮排（支援多行） |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | 下一個 / 上一個分頁 |
| `Ctrl+W` | 關閉分頁 |
| `Alt+←` / `Alt+→` | 上一頁 / 下一頁 |

## 從原始碼建置

```powershell
cd src
dotnet publish -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

輸出：`src/bin/Release/net9.0-windows/win-x64/publish/MarkDownEditor.exe`
將 `web/` 資料夾（以及選用的 WebView2 固定版本執行階段 `Runtime/`）放在 exe 旁邊即可。

### 架構一覽

C#（WPF）端負責檔案 I/O、單一執行個體管道和視窗外框；Web 端（單一 WebView2 中的原生 JS）擁有全部文件緩衝區和分頁狀態。兩者僅透過 `postMessage` 通訊。渲染使用 marked + highlight.js + mermaid，全部離線內建。完整功能介紹請參閱 [README.ko.md](README.ko.md)（韓文）或 [README.md](README.md)（英文）。

## 意見回饋

歡迎到 [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose) 回報問題或提出功能建議——也可以在應用程式內點選標題旁的版本號直接前往（問題回報表單會自動填入目前版本）。

## 授權

MIT — 參見 [LICENSE](LICENSE)。內建的第三方元件見
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)（註：mermaid 包含一個已記錄的小型本機修補）。
