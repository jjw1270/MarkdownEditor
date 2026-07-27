[CmdletBinding()]
param(
    [string]$AppPath = "$env:LOCALAPPDATA\Programs\MarkDownEditor\MarkDownEditor.exe"
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path -LiteralPath $AppPath -PathType Leaf)) { throw "App not found: $AppPath" }
$nativeSource = @'
using System;
using System.Runtime.InteropServices;
public static class TitlebarE2ENative {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr hWnd, int x, int y, int width, int height, bool repaint);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int command);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr value);
}
'@
Add-Type -TypeDefinition $nativeSource
[TitlebarE2ENative]::SetProcessDpiAwarenessContext([IntPtr](-4)) | Out-Null

function Get-Rect([IntPtr]$Handle) {
    $rect = New-Object TitlebarE2ENative+RECT
    [TitlebarE2ENative]::GetWindowRect($Handle, [ref]$rect) | Out-Null
    return $rect
}
function Click([int]$X, [int]$Y) {
    [TitlebarE2ENative]::SetCursorPos($X, $Y) | Out-Null
    [TitlebarE2ENative]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 45
    [TitlebarE2ENative]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
}
function DoubleClick([int]$X, [int]$Y) {
    Click $X $Y
    Start-Sleep -Milliseconds 100
    Click $X $Y
}

$process = Start-Process -FilePath $AppPath -PassThru
try {
    $deadline = (Get-Date).AddSeconds(20)
    do { Start-Sleep -Milliseconds 200; $process.Refresh() }
    while ($process.MainWindowHandle -eq 0 -and -not $process.HasExited -and (Get-Date) -lt $deadline)
    if ($process.HasExited -or $process.MainWindowHandle -eq 0) { throw "Main window did not start" }
    $handle = [IntPtr]$process.MainWindowHandle
    [TitlebarE2ENative]::ShowWindow($handle, 9) | Out-Null
    [TitlebarE2ENative]::MoveWindow($handle, 120, 120, 1200, 800, $true) | Out-Null
    [TitlebarE2ENative]::SetForegroundWindow($handle) | Out-Null
    Start-Sleep -Seconds 2

    $normal = Get-Rect $handle
    DoubleClick ($normal.Right - 450) ($normal.Top + 36)
    Start-Sleep -Milliseconds 700
    $maximized = [TitlebarE2ENative]::IsZoomed($handle)

    $max = Get-Rect $handle
    DoubleClick ($max.Right - 450) ($max.Top + 36)
    Start-Sleep -Milliseconds 700
    $restored = -not [TitlebarE2ENative]::IsZoomed($handle)

    $before = Get-Rect $handle
    $x = $before.Right - 450
    $y = $before.Top + 36
    [TitlebarE2ENative]::SetCursorPos($x, $y) | Out-Null
    [TitlebarE2ENative]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
    foreach ($step in 1..10) {
        [TitlebarE2ENative]::SetCursorPos($x + 10 * $step, $y + 5 * $step) | Out-Null
        Start-Sleep -Milliseconds 30
    }
    [TitlebarE2ENative]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 700
    $after = Get-Rect $handle
    $dragMoved = $after.Left -ne $before.Left -or $after.Top -ne $before.Top

    [pscustomobject]@{
        DoubleClickMaximized = $maximized
        DoubleClickRestored = $restored
        DragMoved = $dragMoved
        BeforeDrag = "$($before.Left),$($before.Top)"
        AfterDrag = "$($after.Left),$($after.Top)"
    } | Format-List
    if (-not ($maximized -and $restored -and $dragMoved)) { throw "Titlebar E2E failed" }
}
finally {
    if (-not $process.HasExited) {
        $process.CloseMainWindow() | Out-Null
        if (-not $process.WaitForExit(5000)) { Stop-Process -Id $process.Id -Force }
    }
}
