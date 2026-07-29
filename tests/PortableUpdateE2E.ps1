[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$qaRoot = [IO.Path]::GetFullPath((Join-Path $repo "artifacts\qa-portable-update"))
$artifactsRoot = [IO.Path]::GetFullPath((Join-Path $repo "artifacts"))
if (-not $qaRoot.StartsWith($artifactsRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Unsafe QA path: $qaRoot"
}
if (Test-Path -LiteralPath $qaRoot) { Remove-Item -LiteralPath $qaRoot -Recurse -Force }
$current = Join-Path $qaRoot "current"
$next = Join-Path $qaRoot "next"
$server = Join-Path $qaRoot "server"
New-Item -ItemType Directory -Force -Path $current, $next, $server | Out-Null

[xml]$project = Get-Content -LiteralPath (Join-Path $repo "src\MarkDownEditor.csproj")
$currentVersion = [version][string]$project.Project.PropertyGroup.Version
$currentVersionText = $currentVersion.ToString(3)
$nextVersion = [version]::new($currentVersion.Major, $currentVersion.Minor, $currentVersion.Build + 1)
$nextVersionText = $nextVersion.ToString(3)

foreach ($build in @(@{ Version = $currentVersionText; Output = $current }, @{ Version = $nextVersionText; Output = $next })) {
    & dotnet publish (Join-Path $repo "src\MarkDownEditor.csproj") -c Debug -r win-x64 `
        --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true `
        "-p:Version=$($build.Version)" -o $build.Output | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Portable E2E publish failed for $($build.Version)" }
}

Copy-Item -LiteralPath (Join-Path $repo "artifacts\MarkDownEditor-standalone\Runtime") `
    -Destination (Join-Path $current "Runtime") -Recurse
$updateZip = Join-Path $server "MarkDownEditor-standalone.zip"
Copy-Item -LiteralPath (Join-Path $repo "artifacts\MarkDownEditor-standalone.zip") -Destination $updateZip

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::Open($updateZip, [IO.Compression.ZipArchiveMode]::Update)
try {
    $oldExe = $archive.GetEntry("MarkDownEditor.exe")
    if (-not $oldExe) { throw "Portable ZIP has no executable" }
    $oldExe.Delete()
    $newExe = $archive.CreateEntry("MarkDownEditor.exe", [IO.Compression.CompressionLevel]::Optimal)
    $source = [IO.File]::OpenRead((Join-Path $next "MarkDownEditor.exe"))
    $destination = $newExe.Open()
    try { $source.CopyTo($destination) }
    finally { $destination.Dispose(); $source.Dispose() }
}
finally { $archive.Dispose() }

$size = (Get-Item -LiteralPath $updateZip).Length
$sha = (Get-FileHash -LiteralPath $updateZip -Algorithm SHA256).Hash.ToLowerInvariant()
$release = @{
    tag_name = "v$nextVersionText"
    body = "Portable update E2E"
    assets = @(@{
        name = "MarkDownEditor-standalone.zip"
        browser_download_url = "http://127.0.0.1:18766/MarkDownEditor-standalone.zip"
        size = $size
        digest = "sha256:$sha"
    })
} | ConvertTo-Json -Depth 4
[IO.File]::WriteAllText((Join-Path $server "release.json"), $release, [Text.UTF8Encoding]::new($false))

$serverProcess = Start-Process -FilePath "python" `
    -ArgumentList "-m", "http.server", "18766", "--bind", "127.0.0.1", "--directory", $server `
    -WindowStyle Hidden -PassThru
$oldApi = $env:MDE_UPDATE_API
$oldAuto = $env:MDE_UPDATE_AUTOTEST
try {
    Start-Sleep -Seconds 1
    $env:MDE_UPDATE_API = "http://127.0.0.1:18766/release.json"
    $env:MDE_UPDATE_AUTOTEST = "1"
    $initial = Start-Process -FilePath (Join-Path $current "MarkDownEditor.exe") -PassThru
    $deadline = (Get-Date).AddMinutes(3)
    $updated = $false
    do {
        Start-Sleep -Seconds 1
        $exe = Join-Path $current "MarkDownEditor.exe"
        if (Test-Path -LiteralPath $exe) {
            $version = (Get-Item -LiteralPath $exe).VersionInfo.FileVersion
            if ($version -like "$nextVersionText*") { $updated = $true; break }
        }
    } while ((Get-Date) -lt $deadline)

    $cleanupDeadline = (Get-Date).AddSeconds(20)
    $tempZip = Join-Path $env:TEMP "MarkDownEditor-update.zip"
    $tempHelper = Join-Path $env:TEMP "MarkDownEditor-update.ps1"
    while (((Test-Path -LiteralPath $tempZip) -or (Test-Path -LiteralPath $tempHelper) -or
            (Test-Path -LiteralPath (Join-Path $current ".update"))) -and (Get-Date) -lt $cleanupDeadline) {
        Start-Sleep -Milliseconds 250
    }
    $runtimePresent = Test-Path -LiteralPath (Join-Path $current "Runtime\msedgewebview2.exe")
    $webPresent = Test-Path -LiteralPath (Join-Path $current "web\index.html")
    $cleanupComplete = -not (Test-Path -LiteralPath $tempZip) -and
        -not (Test-Path -LiteralPath $tempHelper) -and
        -not (Test-Path -LiteralPath (Join-Path $current ".update"))
    [pscustomobject]@{
        PortableUpdateApplied = $updated
        PortableFileVersion = (Get-Item -LiteralPath (Join-Path $current "MarkDownEditor.exe")).VersionInfo.FileVersion
        RuntimePresent = $runtimePresent
        WebAssetsPresent = $webPresent
        TemporaryFilesRemoved = $cleanupComplete
    } | Format-List
    if (-not $updated -or -not $runtimePresent -or -not $webPresent -or -not $cleanupComplete) {
        throw "Portable update E2E failed"
    }
}
finally {
    $env:MDE_UPDATE_API = $oldApi
    $env:MDE_UPDATE_AUTOTEST = $oldAuto
    foreach ($process in Get-Process -Name MarkDownEditor -ErrorAction SilentlyContinue) {
        $path = $process.Path
        if ($path -and $path.StartsWith($qaRoot, [StringComparison]::OrdinalIgnoreCase)) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    if (-not $serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id -Force }
}
