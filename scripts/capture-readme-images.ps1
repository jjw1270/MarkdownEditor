[CmdletBinding()]
param(
    [string]$AppPath = "",
    [string]$OutputRoot = "",
    [string[]]$LocaleFilter = @()
)

$ErrorActionPreference = "Stop"
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
if ([string]::IsNullOrWhiteSpace($AppPath)) {
    $AppPath = Join-Path $repoRoot "artifacts\publish\MarkDownEditor.exe"
}
if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
    $OutputRoot = Join-Path $repoRoot "docs\images"
}
if (-not (Test-Path -LiteralPath $AppPath -PathType Leaf)) { throw "App not found: $AppPath" }

Add-Type -AssemblyName System.Drawing
$nativeSource = @'
using System;
using System.Runtime.InteropServices;
public static class ReadmeCaptureNative {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr hWnd, int x, int y, int width, int height, bool repaint);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr insertAfter, int x, int y, int width, int height, uint flags);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int command);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr value);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr hWnd);
}
'@
Add-Type -TypeDefinition $nativeSource
[ReadmeCaptureNative]::SetProcessDpiAwarenessContext([IntPtr](-4)) | Out-Null

function Save-WindowImage([IntPtr]$Handle, [string]$Path) {
    $rect = New-Object ReadmeCaptureNative+RECT
    if (-not [ReadmeCaptureNative]::GetWindowRect($Handle, [ref]$rect)) { throw "GetWindowRect failed" }
    $width = $rect.Right - $rect.Left
    $height = $rect.Bottom - $rect.Top
    $bitmap = [Drawing.Bitmap]::new($width, $height)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
        $bitmap.Save($Path, [Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

$locales = [ordered]@{
    "en" = @("MarkDownEditor Guide", "A fast, private Markdown viewer and editor for Windows.", "What it can do", "Open many documents as tabs", "Render tables, code and Mermaid diagrams offline", "Edit with formatting tools and export to PDF", "Keep documents on this computer", "Common shortcuts", "Action", "Open", "Edit / Preview", "Find", "Next tab", "More", "Local images, links, dark mode and ten UI languages")
    "ko" = @("MarkDownEditor 안내", "빠르고 개인정보를 보호하는 Windows용 마크다운 뷰어 겸 에디터입니다.", "이런 것들이 됩니다", "여러 문서를 탭으로 열기", "표·코드·Mermaid 다이어그램을 오프라인 렌더링", "서식 도구로 편집하고 PDF로 내보내기", "문서를 이 PC 안에 보관", "자주 쓰는 단축키", "동작", "열기", "편집 / 미리보기", "찾기", "다음 탭", "더 보기", "로컬 이미지·링크·다크 모드·UI 10개 언어")
    "ja" = @("MarkDownEditor ガイド", "高速でプライバシーを守る Windows 用 Markdown ビューアー兼エディターです。", "できること", "複数の文書をタブで開く", "表・コード・Mermaid 図をオフラインで表示", "書式ツールで編集して PDF に出力", "文書をこの PC 内に保存", "よく使うショートカット", "操作", "開く", "編集 / プレビュー", "検索", "次のタブ", "その他", "ローカル画像・リンク・ダークモード・10 言語 UI")
    "zh-CN" = @("MarkDownEditor 指南", "快速、注重隐私的 Windows Markdown 查看器和编辑器。", "功能", "以标签页打开多个文档", "离线渲染表格、代码和 Mermaid 图", "使用格式工具编辑并导出 PDF", "文档始终保留在本机", "常用快捷键", "操作", "打开", "编辑 / 预览", "查找", "下一个标签页", "更多", "本地图片、链接、深色模式和十种界面语言")
    "zh-TW" = @("MarkDownEditor 指南", "快速且重視隱私的 Windows Markdown 檢視器與編輯器。", "功能", "以分頁開啟多份文件", "離線呈現表格、程式碼與 Mermaid 圖", "使用格式工具編輯並匯出 PDF", "文件始終保留在本機", "常用快速鍵", "動作", "開啟", "編輯 / 預覽", "尋找", "下一個分頁", "更多", "本機圖片、連結、深色模式與十種介面語言")
    "es" = @("Guía de MarkDownEditor", "Un visor y editor Markdown rápido y privado para Windows.", "Qué puede hacer", "Abrir varios documentos en pestañas", "Renderizar tablas, código y Mermaid sin conexión", "Editar con herramientas de formato y exportar a PDF", "Mantener los documentos en este equipo", "Atajos habituales", "Acción", "Abrir", "Editar / Vista previa", "Buscar", "Pestaña siguiente", "Más", "Imágenes locales, enlaces, modo oscuro y diez idiomas")
    "fr" = @("Guide MarkDownEditor", "Un lecteur et éditeur Markdown rapide et respectueux de la vie privée pour Windows.", "Fonctions", "Ouvrir plusieurs documents dans des onglets", "Afficher tableaux, code et Mermaid hors ligne", "Modifier avec la barre de formatage et exporter en PDF", "Garder les documents sur cet ordinateur", "Raccourcis courants", "Action", "Ouvrir", "Édition / Aperçu", "Rechercher", "Onglet suivant", "Plus", "Images locales, liens, thème sombre et dix langues")
    "de" = @("MarkDownEditor-Leitfaden", "Ein schneller, privater Markdown-Betrachter und -Editor für Windows.", "Funktionen", "Mehrere Dokumente als Tabs öffnen", "Tabellen, Code und Mermaid offline darstellen", "Mit Formatierungswerkzeugen bearbeiten und als PDF exportieren", "Dokumente auf diesem Computer behalten", "Häufige Tastenkürzel", "Aktion", "Öffnen", "Bearbeiten / Vorschau", "Suchen", "Nächster Tab", "Mehr", "Lokale Bilder, Links, dunkles Design und zehn UI-Sprachen")
    "ru" = @("Руководство MarkDownEditor", "Быстрый и конфиденциальный просмотрщик и редактор Markdown для Windows.", "Возможности", "Открывать несколько документов во вкладках", "Показывать таблицы, код и Mermaid без сети", "Редактировать с форматированием и экспортировать PDF", "Хранить документы только на этом компьютере", "Частые сочетания клавиш", "Действие", "Открыть", "Правка / просмотр", "Найти", "Следующая вкладка", "Дополнительно", "Локальные изображения, ссылки, тёмная тема и десять языков")
    "pt-BR" = @("Guia do MarkDownEditor", "Um visualizador e editor Markdown rápido e privado para Windows.", "O que ele faz", "Abrir vários documentos em abas", "Renderizar tabelas, código e Mermaid offline", "Editar com ferramentas de formatação e exportar PDF", "Manter os documentos neste computador", "Atalhos comuns", "Ação", "Abrir", "Editar / Visualizar", "Localizar", "Próxima aba", "Mais", "Imagens locais, links, tema escuro e dez idiomas")
}

$demoRoot = Join-Path $repoRoot "artifacts\screenshot-docs"
New-Item -ItemType Directory -Force -Path $demoRoot | Out-Null
$unknownLocales = @($LocaleFilter | Where-Object { -not $locales.Contains($_) })
if ($unknownLocales.Count -gt 0) { throw "Unknown locale: $($unknownLocales -join ', ')" }
$previousLang = $env:MDE_LANG
try {
    foreach ($entry in $locales.GetEnumerator()) {
        $code = $entry.Key
        if ($LocaleFilter.Count -gt 0 -and $code -notin $LocaleFilter) { continue }
        $t = $entry.Value
        $markdown = @"
# $($t[0])

**$($t[1])**

## $($t[2])

- $($t[3])
- $($t[4])
- $($t[5])
- $($t[6])

## $($t[7])

| Key | $($t[8]) |
|---|---|
| ``Ctrl+O`` | $($t[9]) |
| ``Ctrl+E`` | $($t[10]) |
| ``Ctrl+F`` | $($t[11]) |
| ``Ctrl+Tab`` | $($t[12]) |

## $($t[13])

- $($t[14])
"@
        $demoPath = Join-Path $demoRoot "$code.md"
        [IO.File]::WriteAllText($demoPath, $markdown, [Text.UTF8Encoding]::new($false))
        $localeOutput = Join-Path $OutputRoot $code
        New-Item -ItemType Directory -Force -Path $localeOutput | Out-Null

        $env:MDE_LANG = $code
        $handle = [IntPtr]::Zero
        $process = Start-Process -FilePath $AppPath -ArgumentList ('"' + $demoPath + '"') -PassThru
        try {
            $deadline = (Get-Date).AddSeconds(25)
            do { Start-Sleep -Milliseconds 200; $process.Refresh() }
            while ($process.MainWindowHandle -eq 0 -and -not $process.HasExited -and (Get-Date) -lt $deadline)
            if ($process.HasExited -or $process.MainWindowHandle -eq 0) { throw "App launch failed for $code" }
            $handle = [IntPtr]$process.MainWindowHandle
            [ReadmeCaptureNative]::ShowWindow($handle, 9) | Out-Null
            [ReadmeCaptureNative]::MoveWindow($handle, 40, 40, 1440, 900, $true) | Out-Null
            # CopyFromScreen은 앞에 뜬 창까지 찍으므로 캡처 동안 대상 창을 최상단에 고정한다.
            [ReadmeCaptureNative]::SetWindowPos($handle, [IntPtr](-1), 0, 0, 0, 0, 0x0043) | Out-Null
            [ReadmeCaptureNative]::SetForegroundWindow($handle) | Out-Null
            $rect = New-Object ReadmeCaptureNative+RECT
            [ReadmeCaptureNative]::GetWindowRect($handle, [ref]$rect) | Out-Null
            $scale = [ReadmeCaptureNative]::GetDpiForWindow($handle) / 96.0
            # SetForegroundWindow가 거부되어도 다른 창에 가려지지 않는 제목 표시줄 클릭으로 전면 활성화한다.
            [ReadmeCaptureNative]::SetCursorPos(
                $rect.Left + [int](720 * $scale), $rect.Top + [int](20 * $scale)) | Out-Null
            [ReadmeCaptureNative]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
            [ReadmeCaptureNative]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
            Start-Sleep -Seconds 3
            Save-WindowImage $handle (Join-Path $localeOutput "preview.png")

            # 언어 버튼은 우측 창 제어 버튼 묶음의 왼쪽에 있으며 CSS 좌표를 실제 픽셀로 환산한다.
            [ReadmeCaptureNative]::SetCursorPos(
                $rect.Right - [int](154 * $scale), $rect.Top + [int](24 * $scale)) | Out-Null
            [ReadmeCaptureNative]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
            [ReadmeCaptureNative]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
            # 메뉴를 연 뒤 포인터를 문서로 옮겨 언어 버튼의 hover 툴팁이 캡처에 남지 않게 한다.
            [ReadmeCaptureNative]::SetCursorPos(
                $rect.Left + [int](700 * $scale), $rect.Top + [int](500 * $scale)) | Out-Null
            Start-Sleep -Milliseconds 600
            Save-WindowImage $handle (Join-Path $localeOutput "menu.png")
        }
        finally {
            if ($handle -ne [IntPtr]::Zero) {
                [ReadmeCaptureNative]::SetWindowPos($handle, [IntPtr](-2), 0, 0, 0, 0, 0x0003) | Out-Null
            }
            if (-not $process.HasExited) {
                $process.CloseMainWindow() | Out-Null
                if (-not $process.WaitForExit(5000)) { Stop-Process -Id $process.Id }
            }
        }
    }
}
finally {
    $env:MDE_LANG = $previousLang
}

[xml]$project = Get-Content -LiteralPath (Join-Path $repoRoot "src\MarkDownEditor.csproj")
$version = [string]$project.Project.PropertyGroup.Version
$manifest = [ordered]@{
    appVersion = $version
    capturedAtUtc = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
    window = "1440x900"
    locales = foreach ($code in $locales.Keys) {
        [ordered]@{
            code = $code
            preview = "${code}/preview.png"
            menu = "${code}/menu.png"
            previewSha256 = (Get-FileHash -LiteralPath (Join-Path $OutputRoot "$code\preview.png") -Algorithm SHA256).Hash.ToLowerInvariant()
            menuSha256 = (Get-FileHash -LiteralPath (Join-Path $OutputRoot "$code\menu.png") -Algorithm SHA256).Hash.ToLowerInvariant()
        }
    }
}
[IO.File]::WriteAllText(
    (Join-Path $OutputRoot "manifest.json"),
    ($manifest | ConvertTo-Json -Depth 4), [Text.UTF8Encoding]::new($false))

$capturedLocaleCount = if ($LocaleFilter.Count -gt 0) { $LocaleFilter.Count } else { $locales.Count }
Write-Host "Localized README screenshots captured for $capturedLocaleCount languages."
