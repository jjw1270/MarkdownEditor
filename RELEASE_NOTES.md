MarkDownEditor 1.3.1 is a maintenance release focused on saving, file reloads, document anchors, and update safety.

## Changes

- Saves to the same file now run in request order. If `Ctrl+S` is pressed again while a save is still running, an older request can no longer overwrite the newer text or clear its unsaved marker.
- An external edit made immediately after an in-app save is detected instead of being ignored by the save-event debounce.
- Windows paths that differ only by letter case resolve to the same tab.
- Heading anchors preserve Japanese, Chinese, accented, Cyrillic, Korean, and other Unicode text.
- Raw HTML in a Markdown preview can no longer add scripts, frames, forms, event handlers, or styles that affect the whole application window.
- Portable updates reject ambiguous archive paths, alternate data streams, and link entries. Available disk space is checked against the expanded package size before extraction.
- The automated QA suite now covers these cases through the running WebView2 application. Release workflows use current SHA-pinned GitHub Actions and verify the bundled Fixed WebView2 Runtime version.

## Downloads

- `MarkDownEditor-Setup-x64.exe` — per-user Windows installer.
- `MarkDownEditor-standalone.zip` — portable package with Fixed WebView2 Runtime.
- `SHA256SUMS.txt` and `release-manifest.json` — checksums and build metadata.

The binaries are not Authenticode-signed, so Windows SmartScreen may show a warning on first run. The updater verifies the GitHub asset digest, package structure, and application version before applying an update.
