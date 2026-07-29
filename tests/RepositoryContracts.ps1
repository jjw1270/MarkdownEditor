$ErrorActionPreference = "Stop"
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

[xml]$project = Get-Content -LiteralPath (Join-Path $repoRoot "src\MarkDownEditor.csproj")
$version = [string]$project.Project.PropertyGroup.Version
$target = [string]$project.Project.PropertyGroup.TargetFramework
$global = Get-Content -LiteralPath (Join-Path $repoRoot "global.json") -Raw | ConvertFrom-Json
$update = Get-Content -LiteralPath (Join-Path $repoRoot "src\MainWindow.Update.cs") -Raw
$window = Get-Content -LiteralPath (Join-Path $repoRoot "src\MainWindow.xaml.cs") -Raw
$appJs = Get-Content -LiteralPath (Join-Path $repoRoot "src\web\app.js") -Raw
$installer = Get-Content -LiteralPath (Join-Path $repoRoot "installer\MarkDownEditor.iss") -Raw
$site = Get-Content -LiteralPath (Join-Path $repoRoot "docs\index.html") -Raw
$changelog = Get-Content -LiteralPath (Join-Path $repoRoot "CHANGELOG.md") -Raw
$workflows = Get-ChildItem -LiteralPath (Join-Path $repoRoot ".github\workflows") -Filter "*.yml"

Assert-True ($version -match '^\d+\.\d+\.\d+$') "Project version must have three numeric parts."
Assert-True ($target -eq "net10.0-windows") "Target framework must be net10.0-windows."
Assert-True ($global.sdk.version -eq "10.0.302") "global.json must pin .NET SDK 10.0.302."
Assert-True ($update.Contains('PortableUpdateAssetName = "MarkDownEditor-standalone.zip"')) "Portable update asset contract is missing."
Assert-True ($update.Contains('InstallerUpdateAssetName = "MarkDownEditor-Setup-x64.exe"')) "Installer update asset contract is missing."
Assert-True ($window.Contains('installed.marker')) "Installed-edition marker detection is missing."
Assert-True ($window.Contains('!IsInstalledEdition && File.Exists')) "Installed edition must never select a bundled Fixed Runtime."
Assert-True ($installer.Contains("B33FB6E9-7620-4348-B504-AC4770CC586C")) "Installer AppId changed."
Assert-True ($installer.Contains("PrivilegesRequired=lowest")) "Installer must remain per-user and non-elevated."
Assert-True ($installer.Contains('Type: filesandordirs; Name: "{app}\Runtime"')) "Installer must remove a stale portable Fixed Runtime."
Assert-True (-not ($installer -match 'ValueType:\s*none;\s*ValueName:')) "Named Open With values cannot use Inno ValueType none."
Assert-True ($installer.Contains('AfterInstall: VerifyWebView2Installed')) "Installer must fail when Evergreen WebView2 installation fails."
Assert-True ($update.Contains('$installed = $installer.ExitCode -eq 0')) "Installer updater must check the Setup exit code."
Assert-True ($appJs.Contains("TITLEBAR_DRAG_THRESHOLD_SQ")) "Titlebar drag threshold is missing."
Assert-True (-not ($appJs -match "mousedown'[\s\S]{0,180}postMessage\(\{ cmd: 'windrag' \}\)")) `
    "Titlebar drag must not start directly from mousedown."
Assert-True ($site.Contains(('"softwareVersion": "' + $version + '"'))) "Website version is stale."
Assert-True ($site.Contains('html lang="en"') -or $site.Contains('<html lang="en"')) "Website must use English as the global default."
Assert-True ($changelog.Contains("## $version")) "Changelog does not contain the current version."
foreach ($workflow in $workflows) {
    $content = Get-Content -LiteralPath $workflow.FullName -Raw
    foreach ($use in [regex]::Matches($content, 'uses:\s*[^\s@]+@([^\s#]+)')) {
        Assert-True ($use.Groups[1].Value -match '^[0-9a-f]{40}$') `
            "$($workflow.Name) has an action that is not pinned to a commit SHA: $($use.Value)"
    }
}

$readmes = [ordered]@{
    "README.md" = "en"; "README.ko.md" = "ko"; "README.ja.md" = "ja";
    "README.zh-CN.md" = "zh-CN"; "README.zh-TW.md" = "zh-TW";
    "README.es.md" = "es"; "README.fr.md" = "fr"; "README.de.md" = "de";
    "README.ru.md" = "ru"; "README.pt-BR.md" = "pt-BR"
}
foreach ($pair in $readmes.GetEnumerator()) {
    $content = Get-Content -LiteralPath (Join-Path $repoRoot $pair.Key) -Raw
    Assert-True ($content.Contains(".NET-10.0")) "$($pair.Key) has a stale .NET badge."
    Assert-True ($content.Contains("docs/images/$($pair.Value)/preview.png")) "$($pair.Key) has no localized preview."
    Assert-True ($content.Contains("docs/images/$($pair.Value)/menu.png")) "$($pair.Key) has no localized menu image."
    Assert-True (Test-Path -LiteralPath (Join-Path $repoRoot "docs\images\$($pair.Value)\preview.png")) `
        "Localized preview is missing for $($pair.Value)."
    Assert-True (Test-Path -LiteralPath (Join-Path $repoRoot "docs\images\$($pair.Value)\menu.png")) `
        "Localized menu image is missing for $($pair.Value)."
}

$imageManifest = Get-Content -LiteralPath (Join-Path $repoRoot "docs\images\manifest.json") -Raw | ConvertFrom-Json
Assert-True ($imageManifest.appVersion -eq $version) "Screenshot manifest version is stale."
Assert-True ($imageManifest.locales.Count -eq $readmes.Count) "Screenshot manifest locale count is incomplete."
Add-Type -AssemblyName System.Drawing
foreach ($locale in $imageManifest.locales) {
    Assert-True ($readmes.Values -contains $locale.code) "Screenshot manifest has an unknown locale: $($locale.code)"
    foreach ($kind in @("preview", "menu")) {
        $relative = [string]$locale.$kind
        $path = Join-Path (Join-Path $repoRoot "docs\images") $relative
        Assert-True (Test-Path -LiteralPath $path -PathType Leaf) "Screenshot is missing: $relative"
        $hashProperty = $kind + "Sha256"
        $actualHash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
        Assert-True ($actualHash -eq $locale.$hashProperty) "Screenshot hash is stale: $relative"
        $image = [Drawing.Image]::FromFile($path)
        try { Assert-True ($image.Width -eq 1440 -and $image.Height -eq 900) "Screenshot size must be 1440x900: $relative" }
        finally { $image.Dispose() }
    }
}

foreach ($fileName in $readmes.Keys) {
    $path = Join-Path $repoRoot $fileName
    $content = Get-Content -LiteralPath $path -Raw
    $linkScan = [regex]::Replace($content, '(?s)```.*?```', '')
    $linkScan = [regex]::Replace($linkScan, '`[^`\r\n]*`', '')
    foreach ($match in [regex]::Matches($linkScan, '\[[^\]]*\]\(([^)]+)\)')) {
        $target = $match.Groups[1].Value.Trim('<', '>')
        if ($target -match '^(https?://|mailto:|#)') { continue }
        $target = ($target -split '#', 2)[0]
        if ([string]::IsNullOrWhiteSpace($target)) { continue }
        $resolved = Join-Path (Split-Path $path -Parent) $target
        Assert-True (Test-Path -LiteralPath $resolved) "$fileName has a broken local link: $target"
    }
}

foreach ($match in [regex]::Matches($site, '(?:href|src)="([^"]+)"')) {
    $target = $match.Groups[1].Value
    if ($target -match '^(https?://|mailto:|#|data:)') { continue }
    $resolved = Join-Path (Join-Path $repoRoot "docs") (($target -split '#', 2)[0])
    Assert-True (Test-Path -LiteralPath $resolved) "Website has a broken local link: $target"
}

Write-Host "Repository contracts passed for v$version"
