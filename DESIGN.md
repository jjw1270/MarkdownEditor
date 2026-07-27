# MarkDownEditor Design

## Product intent

MarkDownEditor is a fast, private Windows desktop editor for local Markdown files. It renders documents locally in WebView2, does not upload document content, and keeps the UI usable without a network connection. During app use, network access is limited to explicit links and GitHub release metadata or update assets. On first installation, Setup may also retrieve Evergreen WebView2 from Microsoft when Windows does not already provide it.

## Supported distributions

The repository produces two Windows x64 packages from the same source and version.

| Package | Runtime strategy | Data location | Update strategy |
|---|---|---|---|
| `MarkDownEditor-standalone.zip` | Self-contained .NET plus bundled WebView2 Fixed Runtime | `WebView2Data` beside the executable; `%TEMP%\MarkDownEditor` only when that location is read-only | Verify and atomically replace the portable ZIP payload |
| `MarkDownEditor-Setup-x64.exe` | Self-contained .NET plus system Evergreen WebView2; bootstrapper runs only when Evergreen is absent | `%LOCALAPPDATA%\MarkDownEditor` | Verify and run the new installer so Apps & Features metadata stays correct |

The installer is per-user, does not request elevation, and installs into `%LOCALAPPDATA%\Programs\MarkDownEditor`. It registers MarkDownEditor only as an Open With candidate for `.md` and `.markdown`; it never overwrites Windows `UserChoice` or another program's default association. Uninstall preserves user data by default.

`installed.marker` is the distribution boundary. Its presence selects installed-edition data and update behavior. The portable ZIP must never contain this marker. The installed app never selects a bundled Fixed Runtime, and Setup removes a stale `Runtime/` left by a portable copy previously extracted to the same directory.

## Update trust and failure behavior

The GitHub latest-release API is the metadata source. An update is accepted only when all of these checks pass:

- the tag is exactly `vMAJOR.MINOR.PATCH` and newer than the running version;
- the asset name matches the running distribution;
- the HTTPS download URL stays under this repository's GitHub release path;
- the reported size is bounded and matches the downloaded size;
- GitHub's SHA-256 digest matches the downloaded bytes;
- the portable ZIP contains only the executable, `web/`, and `Runtime/`, with required files and bounded expanded size;
- the downloaded executable or installer file version matches the release tag.

Portable updates are staged beside the app, applied after a confirmed close, and rolled back if a swap fails. Installed updates run the same fixed-AppId installer after a confirmed close and accept only a zero Setup exit code; a failed installer is retained for diagnosis or manual retry. If an update cannot be safely applied, the existing app remains usable and the release page is the fallback.

The GitHub asset digest and asset share the same account trust boundary. Authenticode signing and an independently signed update manifest remain future hardening; no private signing key belongs in this repository.

## Local content security

Markdown is sanitized before rendering. The app page's Content Security Policy blocks script execution, plugins, base URL rewriting, and remote image requests. Local referenced images are resolved by the native host and provided as `data:` URLs. External links require the normal link action and open in the system browser.

The native host accepts only the documented web-message commands and validates file paths and update payloads before acting. New web-to-native commands must preserve this narrow boundary.

## Version and release source of truth

`src/MarkDownEditor.csproj` is the product-version source of truth. `global.json` pins the build SDK. `scripts/build-release.ps1` creates both release assets, `SHA256SUMS.txt`, and `release-manifest.json`. README files, the website, changelog, screenshots, tag, executable metadata, installer metadata, and release title must use the same product version.

GitHub Actions are pinned to commit SHAs and receive only the minimum permissions required by each job. Release builds pin the .NET SDK, Inno Setup installer and hash, WebView2 bootstrapper hash, and the Fixed Runtime seed.

## Compatibility and rollback

- Supported OS baseline: Windows 10 version 1809 or newer, and Windows 11.
- Target architecture: x64.
- Portable users can roll back by replacing the folder with an older release ZIP; user data beside the executable should be backed up first.
- Installed users can run an older setup with the same AppId. User data remains under `%LOCALAPPDATA%\MarkDownEditor`.
- The last portable release remains a fallback if the installer channel has a packaging issue.

## Change checklist

Changes that affect distribution, storage, updater assets, file associations, supported OS/runtime, or public privacy claims must update this document, the English canonical README, all localized README files, the website, and the changelog in the same change. Release QA must cover both packages and verify installation, update or overwrite installation, launch, file opening, data preservation, uninstall, hashes, and public download links.
