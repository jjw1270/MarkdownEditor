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
$resolvedApp = [IO.Path]::GetFullPath($AppPath)
if (-not (Test-Path -LiteralPath $resolvedApp -PathType Leaf)) { throw "App not found: $resolvedApp" }
if (Get-Process -Name MarkDownEditor -ErrorAction SilentlyContinue) {
    throw "Close running MarkDownEditor processes before WebView behavior E2E."
}

if (Test-Path -LiteralPath $qaRoot) { Remove-Item -LiteralPath $qaRoot -Recurse -Force }
New-Item -ItemType Directory -Path $qaRoot | Out-Null
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
$port = Get-Random -Minimum 22000 -Maximum 45000
$oldArgs = $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS
$process = $null
try {
    $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=$port"
    $process = Start-Process -FilePath $resolvedApp -ArgumentList ('"' + $document + '"') -PassThru
    $deadline = (Get-Date).AddSeconds(25)
    $target = $null
    do {
        Start-Sleep -Milliseconds 200
        try {
            $pages = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/list" -TimeoutSec 2
            $target = $pages | Where-Object { $_.url -like "https://app.md.local/index.html*" } | Select-Object -First 1
        }
        catch { }
    } while (-not $target -and -not $process.HasExited -and (Get-Date) -lt $deadline)
    if (-not $target) { throw "WebView DevTools target did not become available." }

    $client = Join-Path $PSScriptRoot "WebViewBehaviorClient.mjs"
    $result = & node $client $target.webSocketDebuggerUrl $document $resolvedApp $caseVariant
    if ($LASTEXITCODE -ne 0) { throw "WebView behavior client failed: $LASTEXITCODE" }
    $result | ConvertFrom-Json | Format-List
}
finally {
    $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = $oldArgs
    if ($process -and -not $process.HasExited) {
        $process.CloseMainWindow() | Out-Null
        if (-not $process.WaitForExit(5000)) { Stop-Process -Id $process.Id -Force }
    }
    if (Test-Path -LiteralPath $qaRoot) { Remove-Item -LiteralPath $qaRoot -Recurse -Force }
}
