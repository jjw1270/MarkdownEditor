# MarkDownEditor

**轻快的 Windows 便携版 Markdown 查看器 & 编辑器。**
双击 `.md` 文件即可打开 — 无需安装。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

![预览 — 浅色主题](docs/images/preview-light.png)

## 亮点

- **便携** — 解压即用。内置 WebView2 运行时，设置与缓存都保存在 exe 旁边，不在系统中留下任何痕迹。
- **自动更新** — 启动时静默检查 GitHub Releases；有新版本时，标题旁的 `!` 徽标会高亮提示，可在应用内带进度条完成更新，设置与会话全部保留。（版本检查是本应用唯一的网络访问，绝不发送任何文档或个人数据。）
- **一个窗口，多个标签页** — 所有文件都在同一窗口中以标签页打开（互斥体 + 命名管道实现单实例）。标签页可拖拽排序，`Ctrl+Tab` 循环切换。
- **所有链接都可用** — `.md` 链接在新标签页打开，网页链接用浏览器，文件夹用资源管理器，其他文档用默认应用。支持跨文档锚点（`doc.md#章节`）。
- **后退 / 前进** — 工具栏按钮、`Alt+←`/`Alt+→`，或鼠标第 4/5 键。
- **GitHub 风格渲染** — 表格、代码高亮（离线）、**mermaid 图表**（离线、跟随主题）。
- **目录侧边栏** — 随阅读位置自动高亮当前章节（scroll-spy）。
- **编辑 ↔ 预览** — `Ctrl+E` 切换，两种模式间滚动位置保持同步。
- **格式栏** — 编辑模式下显示：加粗、标题、列表、复选框、引用、代码、链接、表格、分隔线，一键插入。**不懂 Markdown 语法也能用**（全部可用 `Ctrl+Z` 撤销）。
- **右键菜单** — 预览区（复制、打开链接、复制链接地址、查看图片、查找），编辑区（剪切 / 复制 / 粘贴 / 全选）。
- **查找 / 替换** — `Ctrl+F` 在预览（全部匹配高亮）和编辑模式下均可用；`Ctrl+H` 在编辑模式下替换。
- **导出 PDF** — 保存按钮旁的 `📄`，或 `Ctrl+P`，始终以浅色主题输出。
- **从剪贴板粘贴图片** — 保存到文档旁的 `images/` 文件夹并自动插入链接。
- **外部修改自动刷新** — 其他程序（IDE、编辑器）保存后，已打开的标签页自动更新；未保存的编辑绝不会被悄悄覆盖。
- **自动备份 & 崩溃恢复** — 每 30 秒对未保存的更改做快照，下次启动时提示恢复。
- **会话恢复** — 不带文件启动时，重新打开上次的标签页。最近的文件可从 🕘 按钮打开。
- **韩文编码检测** — 无 BOM 的 CP949/EUC-KR 文件与 UTF-8 一样正常打开。
- **深色 / 浅色主题** — 标题栏 `🌙`/`☀` 按钮切换，记忆上次选择，Windows 标题栏同步变色。
- **界面 10 种语言** — 한국어、English、日本語、简体中文、繁體中文、Español、Français、Deutsch、Русский、Português。默认跟随系统语言，可随时在标题栏 `🌐` 按钮中切换。
- **记事本式紧凑界面** — 标签页与工具集成在自定义标题栏中（拖动空白区域移动窗口，双击最大化）。

![语言菜单](docs/images/menu.png)

## 快速开始

1. 从 Releases 下载 `MarkDownEditor-standalone.zip`，**解压到任意位置**。
2. 运行 `MarkDownEditor.exe`。没有安装程序。
3. （可选）设为 `.md` 默认应用：右键 `.md` 文件 → *打开方式* → *选择其他应用* → 选择 `MarkDownEditor.exe` 并勾选 *始终使用*。

> **SmartScreen 提示** — 程序未进行代码签名，首次运行时 Windows 可能提示"未知发布者"。选择 *更多信息 → 仍要运行*，或按下方步骤从源码自行构建。

### 系统要求

- Windows 10 / 11（64 位）
- 无需安装 WebView2 — 已内置固定版本运行时。（未内置的构建会自动使用系统安装的 Evergreen 运行时。）

## 键盘快捷键

| 按键 | 操作 |
|------|------|
| `Ctrl+O` | 打开（支持多选） |
| `Ctrl+N` | 新建文档标签页 |
| `Ctrl+S` | 保存 |
| `Ctrl+P` | 导出为 PDF |
| `Ctrl+E` | 编辑 / 预览切换 |
| `Ctrl+F` / `Ctrl+H` | 查找 / 替换 |
| `Ctrl+B` / `Ctrl+I` | 加粗 / 斜体（编辑模式，可切换） |
| `Ctrl+K` | 插入链接（编辑模式 — 地址部分处于选中状态） |
| `Tab` / `Shift+Tab` | 增加 / 减少缩进（支持多行） |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | 下一个 / 上一个标签页 |
| `Ctrl+W` | 关闭标签页 |
| `Alt+←` / `Alt+→` | 后退 / 前进 |

## 从源码构建

```powershell
cd src
dotnet publish -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

输出：`src/bin/Release/net9.0-windows/win-x64/publish/MarkDownEditor.exe`
将 `web/` 文件夹（以及可选的 WebView2 固定版本运行时 `Runtime/`）放在 exe 旁边即可。

### 架构一览

C#（WPF）端负责文件读写、单实例管道和窗口外壳；Web 端（单个 WebView2 中的原生 JS）拥有全部文档缓冲区和标签页状态。两者仅通过 `postMessage` 通信。渲染使用 marked + highlight.js + mermaid，全部离线内置。完整功能介绍请参阅 [README.md](README.md)（韩语）或 [README.en.md](README.en.md)（英语）。

## 许可证

MIT — 参见 [LICENSE](LICENSE)。内置的第三方组件见
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)（注：mermaid 包含一个已记录的小型本地补丁）。
