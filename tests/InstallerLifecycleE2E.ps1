[CmdletBinding()]
param(
    [string]$SetupPath
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($SetupPath)) {
    $SetupPath = Join-Path $PSScriptRoot "..\artifacts\MarkDownEditor-Setup-x64.exe"
}
$setup = [IO.Path]::GetFullPath($SetupPath)
$appDir = Join-Path $env:LOCALAPPDATA "Programs\MarkDownEditor"
$dataDir = Join-Path $env:LOCALAPPDATA "MarkDownEditor"
$sentinel = Join-Path $dataDir "qa-preserve.txt"
$shortcut = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\MarkDownEditor\MarkDownEditor.lnk"
if (-not (Test-Path -LiteralPath $setup -PathType Leaf)) { throw "Setup not found: $setup" }

function Install-Final {
    $process = Start-Process -FilePath $setup `
        -ArgumentList "/CURRENTUSER /VERYSILENT /NORESTART /SUPPRESSMSGBOXES" -Wait -PassThru
    if ($process.ExitCode -ne 0) { throw "Installer failed: $($process.ExitCode)" }
}

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
[IO.File]::WriteAllText($sentinel, "preserve")
try {
    Install-Final
    foreach ($process in Get-Process -Name MarkDownEditor -ErrorAction SilentlyContinue) {
        if ($process.Path -and $process.Path.StartsWith($appDir, [StringComparison]::OrdinalIgnoreCase)) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    $uninstaller = Join-Path $appDir "unins000.exe"
    if (-not (Test-Path -LiteralPath $uninstaller)) { throw "Uninstaller is missing" }
    $uninstall = Start-Process -FilePath $uninstaller `
        -ArgumentList "/VERYSILENT /NORESTART /SUPPRESSMSGBOXES" -Wait -PassThru
    if ($uninstall.ExitCode -ne 0) { throw "Uninstaller failed: $($uninstall.ExitCode)" }

    $deadline = (Get-Date).AddSeconds(15)
    while ((Test-Path -LiteralPath $appDir) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 250 }
    $registered = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey("Software\RegisteredApplications")
    $mdOpenWith = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey("Software\Classes\.md\OpenWithProgids")
    $markdownOpenWith = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey("Software\Classes\.markdown\OpenWithProgids")
    try {
        $registeredRemoved = $null -eq $registered -or $null -eq $registered.GetValue("MarkDownEditor", $null)
        $mdRemoved = $null -eq $mdOpenWith -or -not (@($mdOpenWith.GetValueNames()) -contains "MarkDownEditor.Document")
        $markdownRemoved = $null -eq $markdownOpenWith -or -not (@($markdownOpenWith.GetValueNames()) -contains "MarkDownEditor.Document")
    }
    finally {
        if ($registered) { $registered.Dispose() }
        if ($mdOpenWith) { $mdOpenWith.Dispose() }
        if ($markdownOpenWith) { $markdownOpenWith.Dispose() }
    }
    $filesRemoved = -not (Test-Path -LiteralPath $appDir)
    $shortcutRemoved = -not (Test-Path -LiteralPath $shortcut)
    $dataPreserved = (Test-Path -LiteralPath $sentinel) -and (Get-Content -Raw -LiteralPath $sentinel) -eq "preserve"
    [pscustomobject]@{
        InstalledFilesRemoved = $filesRemoved
        StartMenuShortcutRemoved = $shortcutRemoved
        AssociationsRemoved = $registeredRemoved -and $mdRemoved -and $markdownRemoved
        UserDataPreserved = $dataPreserved
    } | Format-List
    if (-not $filesRemoved -or -not $shortcutRemoved -or -not $registeredRemoved -or
        -not $mdRemoved -or -not $markdownRemoved -or -not $dataPreserved) {
        throw "Installer lifecycle E2E failed"
    }
}
finally {
    Install-Final
    [IO.File]::Delete($sentinel)
}
