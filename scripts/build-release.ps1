[CmdletBinding()]
param(
    [string]$RuntimeSource = "",
    [string]$InnoCompiler = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$artifactRoot = [IO.Path]::GetFullPath((Join-Path $repoRoot "artifacts"))
if (-not $artifactRoot.StartsWith($repoRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Artifact path escaped the repository: $artifactRoot"
}

[xml]$project = Get-Content -LiteralPath (Join-Path $repoRoot "src\MarkDownEditor.csproj")
$version = [string]$project.Project.PropertyGroup.Version
if ($version -notmatch '^\d+\.\d+\.\d+$') { throw "Invalid project version: $version" }

if ([string]::IsNullOrWhiteSpace($RuntimeSource)) {
    $RuntimeSource = Join-Path $repoRoot "MarkDownEditor-standalone\Runtime"
}
$RuntimeSource = [IO.Path]::GetFullPath($RuntimeSource)
if (-not (Test-Path -LiteralPath (Join-Path $RuntimeSource "msedgewebview2.exe") -PathType Leaf)) {
    throw "WebView2 Fixed Runtime was not found: $RuntimeSource"
}

$publishDir = Join-Path $artifactRoot "publish"
$portableDir = Join-Path $artifactRoot "MarkDownEditor-standalone"
$portableZip = Join-Path $artifactRoot "MarkDownEditor-standalone.zip"
$setupExe = Join-Path $artifactRoot "MarkDownEditor-Setup-x64.exe"
$cacheDir = Join-Path $artifactRoot "cache"

New-Item -ItemType Directory -Force -Path $artifactRoot, $cacheDir | Out-Null
foreach ($path in @($publishDir, $portableDir)) {
    if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Recurse -Force }
}
foreach ($path in @($portableZip, $setupExe, (Join-Path $artifactRoot "SHA256SUMS.txt"),
        (Join-Path $artifactRoot "release-manifest.json"))) {
    if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
}

& dotnet publish (Join-Path $repoRoot "src\MarkDownEditor.csproj") -c Release -r win-x64 `
    --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true `
    -o $publishDir
if ($LASTEXITCODE -ne 0) { throw "dotnet publish failed: $LASTEXITCODE" }

New-Item -ItemType Directory -Force -Path $portableDir | Out-Null
Copy-Item -LiteralPath (Join-Path $publishDir "MarkDownEditor.exe") -Destination $portableDir
Copy-Item -LiteralPath (Join-Path $publishDir "web") -Destination $portableDir -Recurse
Copy-Item -LiteralPath $RuntimeSource -Destination (Join-Path $portableDir "Runtime") -Recurse
Compress-Archive -LiteralPath (Join-Path $portableDir "MarkDownEditor.exe"),
    (Join-Path $portableDir "web"), (Join-Path $portableDir "Runtime") `
    -DestinationPath $portableZip -CompressionLevel Optimal

$bootstrapper = Join-Path $cacheDir "MicrosoftEdgeWebview2Setup.exe"
$bootstrapperHash = "0223FA1E8D5BD5E4344FB8734E60D088E79F262C0A24444D01F240BC996F04E5"
if (-not (Test-Path -LiteralPath $bootstrapper) -or
    (Get-FileHash -LiteralPath $bootstrapper -Algorithm SHA256).Hash -ne $bootstrapperHash) {
    Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile $bootstrapper
}
if ((Get-FileHash -LiteralPath $bootstrapper -Algorithm SHA256).Hash -ne $bootstrapperHash) {
    throw "WebView2 bootstrapper hash mismatch. Review and intentionally update the pinned hash."
}

if ([string]::IsNullOrWhiteSpace($InnoCompiler)) {
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 7\ISCC.exe"),
        (Join-Path $env:ProgramFiles "Inno Setup 7\ISCC.exe"),
        (Join-Path ${env:ProgramFiles(x86)} "Inno Setup 7\ISCC.exe")
    )
    $InnoCompiler = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}
if ([string]::IsNullOrWhiteSpace($InnoCompiler) -or -not (Test-Path -LiteralPath $InnoCompiler)) {
    throw "Inno Setup 7 compiler was not found."
}

& $InnoCompiler "/DAppVersion=$version" "/DSourceDir=$publishDir" "/DRepoRoot=$repoRoot" `
    "/DOutputDir=$artifactRoot" "/DWebView2Bootstrapper=$bootstrapper" `
    (Join-Path $repoRoot "installer\MarkDownEditor.iss")
if ($LASTEXITCODE -ne 0) { throw "Inno Setup compile failed: $LASTEXITCODE" }

$releaseFiles = @($portableZip, $setupExe)
$sumLines = foreach ($file in $releaseFiles) {
    $hash = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $([IO.Path]::GetFileName($file))"
}
[IO.File]::WriteAllLines(
    (Join-Path $artifactRoot "SHA256SUMS.txt"), $sumLines, [Text.UTF8Encoding]::new($false))

$runtimeVersion = (Get-Item -LiteralPath (Join-Path $RuntimeSource "msedgewebview2.exe")).VersionInfo.ProductVersion
$manifest = [ordered]@{
    version = $version
    target = "win-x64"
    dotnetSdk = (& dotnet --version).Trim()
    webView2FixedRuntime = $runtimeVersion
    webView2BootstrapperSha256 = $bootstrapperHash.ToLowerInvariant()
    assets = foreach ($file in $releaseFiles) {
        [ordered]@{
            name = [IO.Path]::GetFileName($file)
            size = (Get-Item -LiteralPath $file).Length
            sha256 = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
        }
    }
}
[IO.File]::WriteAllText(
    (Join-Path $artifactRoot "release-manifest.json"),
    ($manifest | ConvertTo-Json -Depth 5), [Text.UTF8Encoding]::new($false))

Write-Host "Release artifacts built for v$version"
$releaseFiles + (Join-Path $artifactRoot "SHA256SUMS.txt") +
    (Join-Path $artifactRoot "release-manifest.json") | ForEach-Object { Get-Item -LiteralPath $_ }
