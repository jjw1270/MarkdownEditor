MarkDownEditor is a fast, private Markdown viewer and editor for Windows 10/11. Version 1.3.0 adds a lightweight installer while keeping the fully self-contained portable package.

## Highlights

- Added a ~45 MB per-user Windows installer with Start menu and Open With integration. It uses automatically serviced Evergreen WebView2 and does not request administrator rights.
- The installer needs Internet only when WebView2 is absent and reports an installation error if that prerequisite cannot be installed.
- Kept the ~325 MB portable ZIP with a bundled Fixed WebView2 Runtime for USB and fully offline use.
- Split updates by distribution: portable copies atomically replace the ZIP payload, while installed copies run the next verified installer.
- Added strict update URL, size, SHA-256, archive-structure, required-file, and version validation.
- Blocked automatic remote-image requests from opened Markdown documents.
- Fixed title-bar double-click maximize/restore without regressing normal window dragging.
- Moved to .NET 10 LTS and refreshed all ten README files, localized screenshots, website copy, privacy guidance, and release documentation.

## Downloads

- `MarkDownEditor-Setup-x64.exe` — recommended for normal use.
- `MarkDownEditor-standalone.zip` — fully portable, includes Fixed WebView2 Runtime.
- `SHA256SUMS.txt` and `release-manifest.json` — integrity and build metadata.

## Security note

The binaries are not Authenticode-signed yet, so Windows SmartScreen may display a first-run warning. Release assets include SHA-256 checksums, and the in-app updater verifies GitHub's asset digest and the package version before applying an update.
