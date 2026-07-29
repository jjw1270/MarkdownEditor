MarkDownEditor 1.3.2 improves document zoom and the tab strip without changing the compact application layout.

## Changes

- `Ctrl+Wheel`, `Ctrl++`, and `Ctrl+-` now resize only the document preview and editor text. Tabs, toolbars, dialogs, and window controls remain at 100%.
- The tab row displays the current document zoom. Click the percentage or press `Ctrl+0` to reset it to 100%.
- Document zoom is remembered across launches, keeps the reading position stable while text reflows, and does not change PDF output size.
- The new-document button uses a centered SVG icon and remains visible when the tab list scrolls horizontally.
- A new keyboard button opens a localized shortcut reference; press `Ctrl+/` to open it without leaving the document.
- The WebView2 behavior suite now exercises zoom isolation, editor/preview consistency, reset, persistence after restart, and tab-control geometry in an isolated profile.

## Downloads

- `MarkDownEditor-Setup-x64.exe` — per-user Windows installer.
- `MarkDownEditor-standalone.zip` — portable package with Fixed WebView2 Runtime.
- `SHA256SUMS.txt` and `release-manifest.json` — checksums and build metadata.

The binaries are not Authenticode-signed, so Windows SmartScreen may show a warning on first run. The updater verifies the GitHub asset digest, package structure, and application version before applying an update.
