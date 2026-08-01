MarkDownEditor 1.3.3 adds direct document zoom controls and keeps QA records out of the repository root.

## Changes

- Click the document percentage to open compact minus, reset, and plus controls. Each step changes the zoom by 10% from 50% through 200%.
- `Ctrl+Wheel`, `Ctrl++`, `Ctrl+-`, and `Ctrl+0` continue to work, and document zoom remains isolated from tabs, toolbars, dialogs, window controls, and PDF output.
- The popup supports keyboard focus and assistive-technology labels, disables unavailable limit actions, stays inside the viewport, and closes on Escape or outside interaction.
- The running WebView2 suite now covers popup focus, increment and reset behavior, zoom limits, dismissal paths, placement, and target sizes.
- Dated QA reports now live under `docs/qa` instead of the repository root.

## Downloads

- `MarkDownEditor-Setup-x64.exe` — per-user Windows installer.
- `MarkDownEditor-standalone.zip` — portable package with Fixed WebView2 Runtime.
- `SHA256SUMS.txt` and `release-manifest.json` — checksums and build metadata.

The binaries are not Authenticode-signed, so Windows SmartScreen may show a warning on first run. The updater verifies the GitHub asset digest, package structure, and application version before applying an update.
