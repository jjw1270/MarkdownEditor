$ErrorActionPreference = "Stop"
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$qaRoot = Join-Path $repo "artifacts\qa-installer-update"
$publish = Join-Path $qaRoot "publish"
$server = Join-Path $qaRoot "server"
New-Item -ItemType Directory -Force -Path $publish, $server | Out-Null

& dotnet publish (Join-Path $repo "src\MarkDownEditor.csproj") -c Release -r win-x64 `
    --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true `
    -p:Version=1.3.1 -o $publish
if ($LASTEXITCODE -ne 0) { throw "Fake update publish failed" }

$inno = Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 7\ISCC.exe"
$bootstrap = Join-Path $repo "artifacts\cache\MicrosoftEdgeWebview2Setup.exe"
& $inno "/DAppVersion=1.3.1" "/DSourceDir=$publish" "/DRepoRoot=$repo" `
    "/DOutputDir=$server" "/DWebView2Bootstrapper=$bootstrap" `
    (Join-Path $repo "installer\MarkDownEditor.iss") | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Fake update installer build failed" }

$fakeSetup = Join-Path $server "MarkDownEditor-Setup-x64.exe"
$size = (Get-Item -LiteralPath $fakeSetup).Length
$sha = (Get-FileHash -LiteralPath $fakeSetup -Algorithm SHA256).Hash.ToLowerInvariant()
$release = @{
    tag_name = "v1.3.1"
    body = "Installer update E2E"
    assets = @(@{
        name = "MarkDownEditor-Setup-x64.exe"
        browser_download_url = "http://127.0.0.1:18765/MarkDownEditor-Setup-x64.exe"
        size = $size
        digest = "sha256:$sha"
    })
} | ConvertTo-Json -Depth 4
[IO.File]::WriteAllText(
    (Join-Path $server "release.json"), $release, [Text.UTF8Encoding]::new($false))

& dotnet build (Join-Path $repo "src\MarkDownEditor.csproj") -c Debug | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Debug app build failed" }
$debugDir = Join-Path $repo "src\bin\Debug\net10.0-windows"
$marker = Join-Path $debugDir "installed.marker"
[IO.File]::WriteAllText($marker, "installed", [Text.UTF8Encoding]::new($false))

$serverProcess = Start-Process -FilePath "python" `
    -ArgumentList "-m", "http.server", "18765", "--bind", "127.0.0.1", "--directory", $server `
    -WindowStyle Hidden -PassThru
$oldApi = $env:MDE_UPDATE_API
$oldAuto = $env:MDE_UPDATE_AUTOTEST
try {
    $installedDir = Join-Path $env:LOCALAPPDATA "Programs\MarkDownEditor"
    $staleRuntime = Join-Path $installedDir "Runtime"
    New-Item -ItemType Directory -Force -Path $staleRuntime | Out-Null
    [IO.File]::WriteAllText((Join-Path $staleRuntime "msedgewebview2.exe"), "stale portable runtime")

    Start-Sleep -Seconds 1
    $env:MDE_UPDATE_API = "http://127.0.0.1:18765/release.json"
    $env:MDE_UPDATE_AUTOTEST = "1"
    $initialApp = Start-Process -FilePath (Join-Path $debugDir "MarkDownEditor.exe") -PassThru

    $installedExe = Join-Path $installedDir "MarkDownEditor.exe"
    $deadline = (Get-Date).AddSeconds(90)
    $updated = $false
    do {
        Start-Sleep -Seconds 1
        if (Test-Path -LiteralPath $installedExe) {
            $installedVersion = (Get-Item -LiteralPath $installedExe).VersionInfo.FileVersion
            if ($installedVersion -like "1.3.1*") { $updated = $true; break }
        }
    } while ((Get-Date) -lt $deadline)

    $uninstall = Get-ChildItem "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall" |
        ForEach-Object { Get-ItemProperty $_.PSPath } |
        Where-Object DisplayName -Like "MarkDownEditor*" |
        Select-Object -First 1
    $tempSetup = Join-Path $env:TEMP "MarkDownEditor-update.exe"
    $tempHelper = Join-Path $env:TEMP "MarkDownEditor-installer-update.ps1"
    $cleanupDeadline = (Get-Date).AddSeconds(15)
    while (((Test-Path -LiteralPath $tempSetup) -or (Test-Path -LiteralPath $tempHelper)) -and
        (Get-Date) -lt $cleanupDeadline) { Start-Sleep -Milliseconds 250 }
    $setupRemoved = -not (Test-Path -LiteralPath $tempSetup)
    $helperRemoved = -not (Test-Path -LiteralPath $tempHelper)
    $supportedTypes = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey(
        "Software\Classes\Applications\MarkDownEditor.exe\SupportedTypes")
    $mdOpenWith = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey(
        "Software\Classes\.md\OpenWithProgids")
    $markdownOpenWith = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey(
        "Software\Classes\.markdown\OpenWithProgids")
    try {
        $supportedNames = @($supportedTypes.GetValueNames())
        $mdNames = @($mdOpenWith.GetValueNames())
        $markdownNames = @($markdownOpenWith.GetValueNames())
    }
    finally {
        $supportedTypes.Dispose()
        $mdOpenWith.Dispose()
        $markdownOpenWith.Dispose()
    }
    $associationsRegistered = $supportedNames -contains ".md" -and
        $supportedNames -contains ".markdown" -and
        $mdNames -contains "MarkDownEditor.Document" -and
        $markdownNames -contains "MarkDownEditor.Document"
    $staleRuntimeRemoved = -not (Test-Path -LiteralPath $staleRuntime)
    [pscustomobject]@{
        InstalledUpdateApplied = $updated
        InstalledFileVersion = (Get-Item -LiteralPath $installedExe).VersionInfo.FileVersion
        AppsDisplayVersion = $uninstall.DisplayVersion
        DownloadedSetupRemoved = $setupRemoved
        HelperRemoved = $helperRemoved
        AssociationsRegistered = $associationsRegistered
        StaleRuntimeRemoved = $staleRuntimeRemoved
    } | Format-List
    if (-not $updated -or $uninstall.DisplayVersion -ne "1.3.1" -or -not $setupRemoved -or
        -not $helperRemoved -or -not $associationsRegistered -or -not $staleRuntimeRemoved) {
        throw "Installed update E2E failed"
    }
}
finally {
    $env:MDE_UPDATE_API = $oldApi
    $env:MDE_UPDATE_AUTOTEST = $oldAuto
    foreach ($process in Get-Process -Name MarkDownEditor -ErrorAction SilentlyContinue) {
        $path = $process.Path
        if ($path -and ($path.StartsWith($debugDir, [StringComparison]::OrdinalIgnoreCase) -or
                $path.StartsWith((Join-Path $env:LOCALAPPDATA "Programs\MarkDownEditor"), [StringComparison]::OrdinalIgnoreCase))) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    if (-not $serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id -Force }
    [IO.File]::Delete($marker)
}

$finalSetup = Join-Path $repo "artifacts\MarkDownEditor-Setup-x64.exe"
$final = Start-Process -FilePath $finalSetup `
    -ArgumentList "/CURRENTUSER /VERYSILENT /NORESTART /SUPPRESSMSGBOXES" -Wait -PassThru
if ($final.ExitCode -ne 0) { throw "Final v1.3.0 reinstall failed: $($final.ExitCode)" }
$finalExe = Join-Path $env:LOCALAPPDATA "Programs\MarkDownEditor\MarkDownEditor.exe"
$finalVersion = (Get-Item -LiteralPath $finalExe).VersionInfo.FileVersion
Write-Host "FinalInstalledVersion=$finalVersion"
if ($finalVersion -notlike "1.3.0*") { throw "Final installed version mismatch" }
