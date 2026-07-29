[CmdletBinding()]
param(
    [string]$AppPath = ""
)

$ErrorActionPreference = "Stop"
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$artifactsRoot = [IO.Path]::GetFullPath((Join-Path $repo "artifacts"))
$qaRoot = [IO.Path]::GetFullPath((Join-Path $artifactsRoot "qa-webview-behavior"))
if (-not $qaRoot.StartsWith($artifactsRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Unsafe QA path: $qaRoot"
}
if ([string]::IsNullOrWhiteSpace($AppPath)) {
    $AppPath = Join-Path $artifactsRoot "publish\MarkDownEditor.exe"
}
$sourceApp = [IO.Path]::GetFullPath($AppPath)
if (-not (Test-Path -LiteralPath $sourceApp -PathType Leaf)) { throw "App not found: $sourceApp" }
if (Get-Process -Name MarkDownEditor -ErrorAction SilentlyContinue) {
    throw "Close running MarkDownEditor processes before WebView behavior E2E."
}

function Remove-QaRoot {
    if (-not (Test-Path -LiteralPath $qaRoot)) { return }
    $deadline = (Get-Date).AddSeconds(8)
    do {
        try {
            Remove-Item -LiteralPath $qaRoot -Recurse -Force -ErrorAction Stop
            return
        }
        catch {
            if ((Get-Date) -ge $deadline) { throw }
            Start-Sleep -Milliseconds 250   # WebView2 자식 프로세스가 lockfile을 놓을 때까지 제한적으로 대기
        }
    } while ($true)
}

Remove-QaRoot
New-Item -ItemType Directory -Path $qaRoot | Out-Null
$appDir = Join-Path $qaRoot "app"
New-Item -ItemType Directory -Path $appDir | Out-Null
$resolvedApp = Join-Path $appDir "MarkDownEditor.exe"
Copy-Item -LiteralPath $sourceApp -Destination $resolvedApp
$sourceWeb = Join-Path (Split-Path $sourceApp -Parent) "web"
if (-not (Test-Path -LiteralPath $sourceWeb -PathType Container)) { throw "App web assets not found: $sourceWeb" }
Copy-Item -LiteralPath $sourceWeb -Destination (Join-Path $appDir "web") -Recurse
$zoomFile = Join-Path $appDir "WebView2Data\zoom.txt"
$document = Join-Path $qaRoot "UnicodeCase.md"
$markdown = @'
# 日本語 제목 Café

<style>body { display: none }</style>
<iframe src="index.html"></iframe>
<form action="https://example.com"><input name="secret"></form>
<a href="java&#x0A;script:alert(1)" onclick="alert(1)" style="position:fixed">unsafe</a>
'@
[IO.File]::WriteAllText($document, $markdown, [Text.UTF8Encoding]::new($false))
$caseVariant = $document.ToUpperInvariant()
$oldArgs = $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS
$process = $null

function Start-QaApp([int]$Port) {
    $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=$Port"
    $script:process = Start-Process -FilePath $resolvedApp -ArgumentList ('"' + $document + '"') -PassThru
    $deadline = (Get-Date).AddSeconds(25)
    $target = $null
    do {
        Start-Sleep -Milliseconds 200
        try {
            $pages = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json/list" -TimeoutSec 2
            $target = $pages | Where-Object { $_.url -like "https://app.md.local/index.html*" } | Select-Object -First 1
        }
        catch { }
    } while (-not $target -and -not $script:process.HasExited -and (Get-Date) -lt $deadline)
    if (-not $target) { throw "WebView DevTools target did not become available." }
    return $target
}

function Stop-QaApp {
    if ($script:process -and -not $script:process.HasExited) {
        $script:process.CloseMainWindow() | Out-Null
        if (-not $script:process.WaitForExit(5000)) { Stop-Process -Id $script:process.Id -Force }
    }
    $script:process = $null
}

try {
    $port = Get-Random -Minimum 22000 -Maximum 45000
    $target = Start-QaApp $port
    $client = Join-Path $PSScriptRoot "WebViewBehaviorClient.mjs"
    $result = & node $client $target.webSocketDebuggerUrl $document $resolvedApp $caseVariant $zoomFile exercise
    if ($LASTEXITCODE -ne 0) { throw "WebView behavior client failed: $LASTEXITCODE" }
    $result | ConvertFrom-Json | Format-List

    Stop-QaApp
    $port = Get-Random -Minimum 22000 -Maximum 45000
    $target = Start-QaApp $port
    $restored = & node $client $target.webSocketDebuggerUrl $document $resolvedApp $caseVariant $zoomFile verify-zoom
    if ($LASTEXITCODE -ne 0) { throw "WebView zoom restore client failed: $LASTEXITCODE" }
    $restored | ConvertFrom-Json | Format-List
}
finally {
    $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = $oldArgs
    Stop-QaApp
    Remove-QaRoot
}
