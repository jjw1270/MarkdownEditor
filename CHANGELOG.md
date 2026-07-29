# Changelog

## 1.3.1 — 2026-07-29

- **Reliable overlapping saves** — serializes writes to the same file and tags save responses so an older request cannot overwrite or mark a newer edit as saved.
- **External-change and path fixes** — no longer drops an external write made immediately after an in-app save, and treats Windows paths that differ only by case as the same open document.
- **Unicode anchors** — heading IDs now retain letters, combining marks, and numbers from every supported UI language.
- **Safer rendered HTML** — removes scripts, frames, forms, event handlers, and document-wide styles, with tighter CSP rules for frames, forms, media, and network connections.
- **Update hardening** — rejects ambiguous ZIP paths, alternate data streams, and link entries, and checks free space against the expanded payload size before extraction.
- **Release QA refresh** — adds browser-level save, reload, Unicode, sanitization, and duplicate-tab E2E coverage; updates pinned GitHub Actions and verifies the current Fixed WebView2 Runtime used by portable builds.
- **README copy edit** — replaces promotional and repetitive wording with shorter, factual descriptions across the main documentation and localized installation headings.

## 1.3.0 — 2026-07-28

- **Two supported distributions** — added a lightweight, per-user Windows installer alongside the fully self-contained portable ZIP. The installer uses Evergreen WebView2, adds Start menu and Open With registrations without changing the user's default app, and preserves user data on uninstall.
- **Installer boundary hardening** — installed copies ignore and remove stale portable Fixed Runtimes, require a successful Evergreen prerequisite installation, create real Open With registry values, and retain a failed update installer for diagnosis or retry.
- **Distribution-aware updates** — portable copies continue to replace a staged ZIP atomically; installed copies download and run the next installer so Windows' version and uninstall metadata remain accurate.
- **Update integrity validation** — updates now verify the official HTTPS release URL, reported and downloaded size, GitHub SHA-256 digest, allowed archive structure, required files, and executable or installer version before applying anything.
- **Remote-image privacy** — the Content Security Policy blocks automatic requests for remote images in opened Markdown documents. Local images continue to render through the native host.
- **Title-bar double-click fix** — native dragging starts only after pointer movement crosses a threshold, so double-click reliably toggles maximize/restore without breaking normal dragging.
- **Supported runtime refresh** — moved from .NET 9 to .NET 10 LTS and pinned SDK 10.0.302. Release builds pin Inno Setup 7.0.2 and the WebView2 bootstrapper hash.
- **Global documentation refresh** — updated all ten README files, localized screenshots, installation/removal/privacy guidance, the public website, release process documentation, and minimum-permission SHA-pinned GitHub Actions.

## 1.2.2 — 2026-07-27

- Consolidated update actions into the version menu and replaced the separate alert button with a red status dot.
- Fixed empty release-notes and progress areas appearing when no update was available.
- Fixed single-file publishing so bundled web assets remain available beside the executable, reducing the executable size by about 3.7 MB.

## 1.2.1 — 2026-07-27

- Rendered update release notes as Markdown.
- Fixed preview-tab switches reverting externally reloaded content or pasted-image links.
- Made saves atomic and removed a race that could mark newer edits as saved.
- Fixed stale back-navigation entries and incorrect missing-release-asset status.
- Improved large-document find, Mermaid match counts, message validation, watcher concurrency, pipe timeouts, image-paste responsiveness, and accessibility.
- Refreshed screenshots and clarified privacy and local-data documentation.

## 1.2.0 — 2026-07-27

- Added the version information and feedback menu with repository, bug-report, and feature-request links.
- Added bilingual GitHub issue forms; reports may be written in any language.

## 1.1.1 — 2026-07-27

- Moved the version label from the language menu to the title bar.

## 1.1.0 — 2026-07-27

- Added automatic GitHub release checks, update notifications, release notes, progress display, confirmed-close application, restart, and a release-page fallback for read-only locations.

## 1.0.0 — 2026-07-24

Initial development version (public GitHub releases began with v1.1.0).

- Portable WPF + WebView2 Markdown viewer/editor with tabs, single-instance routing, document navigation, GitHub-style rendering, syntax highlighting, offline Mermaid diagrams, themes, table of contents, synchronized edit/preview scrolling, find/replace, PDF export, pasted and local images, external-change reload, backup/recovery, session restore, recent documents, CP949 detection, ten UI languages, formatting tools, context menus, custom window chrome, remembered zoom, and reduced-motion accessibility.
