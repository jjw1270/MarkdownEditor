[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$AppPath,
    [string]$Edition = "application"
)

$ErrorActionPreference = "Stop"
$resolvedApp = [IO.Path]::GetFullPath($AppPath)
if (-not (Test-Path -LiteralPath $resolvedApp -PathType Leaf)) { throw "App not found: $resolvedApp" }
$document = Join-Path $env:TEMP "MarkDownEditor-file-open-e2e.md"
[IO.File]::WriteAllText($document, "# File open E2E`r`n`r`n$Edition", [Text.UTF8Encoding]::new($false))
$process = Start-Process -FilePath $resolvedApp -ArgumentList ('"' + $document + '"') -PassThru
try {
    $deadline = (Get-Date).AddSeconds(25)
    $opened = $false
    do {
        Start-Sleep -Milliseconds 250
        $process.Refresh()
        if ($process.MainWindowTitle -eq "MarkDownEditor-file-open-e2e.md — Markdown") {
            $opened = $true
            break
        }
    } while (-not $process.HasExited -and (Get-Date) -lt $deadline)

    [pscustomobject]@{
        Edition = $Edition
        FileOpened = $opened
        WindowTitle = $process.MainWindowTitle
    } | Format-List
    if (-not $opened) { throw "$Edition file-open E2E failed" }
}
finally {
    if (-not $process.HasExited) {
        $process.CloseMainWindow() | Out-Null
        if (-not $process.WaitForExit(5000)) { Stop-Process -Id $process.Id -Force }
    }
    [IO.File]::Delete($document)
}
