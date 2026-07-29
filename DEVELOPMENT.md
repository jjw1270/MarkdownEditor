# MarkDownEditor Development Guide

This document is for contributors and maintainers. User installation and usage instructions remain in the localized README files.

## Prerequisites

- Windows 10 version 1809 or newer, or Windows 11, x64
- .NET SDK 10.0.302, pinned by `global.json`
- Microsoft Edge WebView2 Runtime for local execution
- Inno Setup 7.0.2 when building the Windows installer
- A WebView2 Fixed Version Runtime directory when building the portable release

## Build and run

```powershell
dotnet restore .\src\MarkDownEditor.csproj
dotnet build .\src\MarkDownEditor.csproj -c Release
dotnet run --project .\src\MarkDownEditor.csproj
```

The web UI is copied beside the executable as `web/`. It must remain a directory because the WPF host serves it through a WebView2 virtual host.

To create a self-contained executable without packaging:

```powershell
dotnet publish .\src\MarkDownEditor.csproj -c Release -r win-x64 `
  --self-contained true `
  -p:PublishSingleFile=true `
  -p:IncludeNativeLibrariesForSelfExtract=true
```

## Architecture

```text
Explorer or a second process
            |
            v
App.xaml.cs
single-instance mutex and named-pipe routing
            |
            v
MainWindow.xaml.cs ---------------- MainWindow.Update.cs
WPF window, file I/O, WebView2 host   update validation and apply flow
            |
            | WebView2 postMessage
            v
web/app.js
document buffers, tabs, rendering, backup and recovery
            |
            +-- marked.min.js       Markdown parsing
            +-- highlight.min.js    syntax highlighting
            +-- mermaid.min.js      diagrams
```

The native side owns file access, Windows integration, the single-instance channel, window behavior, PDF export, and updates. The web side owns document buffers, tab state, editor state, and preview rendering. A single WebView2 instance hosts all tabs.

Keep the web-to-native message boundary narrow. New commands must validate paths and other external input on the native side. See [DESIGN.md](DESIGN.md) for distribution, storage, update trust, compatibility, and rollback decisions.

## Project layout

```text
src/
├─ App.xaml(.cs)          application entry point and single-instance routing
├─ MainWindow.xaml(.cs)   WPF shell, WebView2 host, file I/O and Windows actions
├─ MainWindow.Update.cs   update discovery, verification, staging and apply flow
├─ Loc.cs                 native UI strings
├─ app.manifest           Windows compatibility and DPI declarations
├─ MarkDownEditor.csproj  version, target framework and package references
└─ web/
   ├─ index.html          application layout
   ├─ style.css           themes, preview, editor and print styles
   ├─ app.js              application state and WebView2 bridge
   ├─ i18n.js             web UI strings
   ├─ marked.min.js       Markdown parser
   ├─ highlight.min.js    syntax highlighter
   └─ mermaid.min.js      diagram renderer

installer/
└─ MarkDownEditor.iss     per-user Inno Setup definition

scripts/
├─ build-release.ps1      builds both distributions and their manifests
└─ capture-readme-images.ps1

tests/
├─ RepositoryContracts.ps1
├─ UpdateValidation/
├─ WebViewBehaviorE2E.ps1
├─ PortableUpdateE2E.ps1
├─ InstallerUpdateE2E.ps1
├─ InstallerLifecycleE2E.ps1
├─ FileOpenE2E.ps1
└─ TitlebarE2E.ps1
```

## Tests

Run the repository and compilation gates first:

```powershell
.\tests\RepositoryContracts.ps1
node --check .\src\web\app.js
node --check .\src\web\i18n.js
dotnet build .\src\MarkDownEditor.csproj -c Release
```

After building release artifacts, validate the package and the running WebView:

```powershell
dotnet run --project .\tests\UpdateValidation\UpdateValidation.csproj -c Release -- `
  .\artifacts\MarkDownEditor-standalone.zip `
  .\artifacts\MarkDownEditor-standalone `
  .\artifacts\MarkDownEditor-Setup-x64.exe

.\tests\WebViewBehaviorE2E.ps1 -AppPath .\artifacts\publish\MarkDownEditor.exe
```

The following tests change the local installation state and should be run on a disposable Windows test account or machine:

```powershell
.\tests\PortableUpdateE2E.ps1
.\tests\InstallerUpdateE2E.ps1
.\tests\InstallerLifecycleE2E.ps1
.\tests\FileOpenE2E.ps1 -AppPath <installed-or-portable-exe>
.\tests\TitlebarE2E.ps1
```

The latest complete release matrix is recorded in [QA_REPORT_2026-07-29.md](QA_REPORT_2026-07-29.md).

## Release packages

`src/MarkDownEditor.csproj` is the product-version source of truth. Build both distributions with:

```powershell
.\scripts\build-release.ps1 `
  -RuntimeSource C:\path\to\WebView2FixedRuntime `
  -InnoCompiler "C:\path\to\ISCC.exe"
```

The script creates:

- `artifacts/MarkDownEditor-Setup-x64.exe`
- `artifacts/MarkDownEditor-standalone.zip`
- `artifacts/SHA256SUMS.txt`
- `artifacts/release-manifest.json`

Before tagging a release, update the changelog, release notes, website version, screenshot manifest, and user documentation. `RepositoryContracts.ps1` checks the synchronized version and public-document contracts.

The release workflow is triggered by a `vMAJOR.MINOR.PATCH` tag. It rebuilds both packages, validates update boundaries, and creates the GitHub Release.

## Bundled web libraries

Third-party licenses are listed in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). `src/web/mermaid.min.js` contains a documented local text-width patch. Reapply and retest that patch when replacing the Mermaid bundle.
