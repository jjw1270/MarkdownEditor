using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Animation;
using Microsoft.Web.WebView2.Core;
using Microsoft.Win32;

namespace MarkDownEditor;

public partial class MainWindow : Window
{
    private const string VirtualHost = "app.md.local";
    private bool _anyDirty;                       // 열린 탭 중 하나라도 변경됨 → 닫기 확인용
    private bool _webReady;
    private readonly List<string> _startupFiles = new();   // 명령줄로 받은 시작 파일들
    private readonly List<string> _pendingFiles = new();   // 웹 준비 전 도착한 외부 파일

    // 문서에 참조된 로컬 이미지 경로를 찾기 위한 정규식 (마크다운 / HTML)
    // <경로> 각괄호 형식은 공백 포함 경로를 허용 (marked의 파싱 규칙과 동일)
    private static readonly Regex MdImageRegex =
        new(@"!\[[^\]]*\]\(\s*(?:<(?<src>[^>\r\n]+)>|(?<src>[^)\s]+))", RegexOptions.Compiled);
    private static readonly Regex HtmlImageRegex =
        new(@"<img\b[^>]*?\bsrc\s*=\s*[""'](?<src>[^""']+)[""']", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private static string? _dataDir;
    internal static bool IsInstalledEdition =>
        File.Exists(Path.Combine(AppContext.BaseDirectory, "installed.marker"));
    internal static string DataDir => _dataDir ??= ResolveDataDir();   // Loc(lang.txt)도 사용
    private static string ThemeFile => Path.Combine(DataDir, "theme.txt");

    // PDF 내보내기: 웹이 mermaid를 라이트로 재렌더 완료했다는 신호
    private TaskCompletionSource<bool>? _printReady;

    // ---- 외부 변경 감지: 열린 문서가 다른 프로그램에서 저장되면 웹에 알림 ----
    private readonly Dictionary<string, FileSystemWatcher> _watchers = new(StringComparer.OrdinalIgnoreCase);   // 폴더 → 감시자
    private readonly HashSet<string> _watchedFiles = new(StringComparer.OrdinalIgnoreCase);                     // 열린 파일 전체 경로
    private readonly Dictionary<string, System.Windows.Threading.DispatcherTimer> _reloadTimers = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, Task> _saveChains = new(StringComparer.OrdinalIgnoreCase);             // 같은 파일 저장 순서 보장

    public MainWindow()
    {
        InitializeComponent();
        // 마지막 테마(없으면 시스템 테마)에 맞춰 스플래시/창 배경을 미리 칠해 깜빡임 방지
        // (테마 자체는 웹(localStorage)이 소유하고, C#은 시작 시 스플래시 색상용으로만 한 번 읽음)
        var theme = ResolveInitialTheme();
        ApplySplashTheme(theme);
        SplashSub.Text = Loc.Loading;   // 스플래시 문구 로케일 적용 (XAML 기본값은 한국어)
        // 타이틀바는 창 핸들이 생긴 뒤에만 칠할 수 있음 (웹이 보내는 theme 메시지로 이후 재동기화)
        SourceInitialized += (_, _) => ApplyTitleBarTheme(theme);
        Loaded += OnLoaded;
        Closing += OnClosing;
        Closed += (_, _) => LaunchHelperIfPending();   // 업데이트 적용은 종료가 "확정"된 뒤에만
        StateChanged += OnWindowStateChanged;
    }

    // ---- 타이틀바 다크/라이트 동기화 (Windows 10 20H1+ / 11) ----
    [System.Runtime.InteropServices.DllImport("dwmapi.dll")]
    private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attribute, ref int value, int size);
    private const int DwmaUseImmersiveDarkMode = 20;

    // ---- 커스텀 타이틀바: 웹 상단 바의 드래그/리사이즈를 네이티브 창 조작으로 변환 ----
    [System.Runtime.InteropServices.DllImport("user32.dll")]
    private static extern bool ReleaseCapture();
    [System.Runtime.InteropServices.DllImport("user32.dll")]
    private static extern IntPtr SendMessage(IntPtr hWnd, int msg, IntPtr wParam, IntPtr lParam);
    private const int WmNcLButtonDown = 0x00A1;

    // HTCAPTION=2(이동), HTLEFT=10 … HTBOTTOMRIGHT=17(가장자리 리사이즈)
    private void BeginNativeDrag(int hitTest)
    {
        var hwnd = new System.Windows.Interop.WindowInteropHelper(this).Handle;
        if (hwnd == IntPtr.Zero) return;
        ReleaseCapture();
        SendMessage(hwnd, WmNcLButtonDown, hitTest, IntPtr.Zero);
    }

    private static int HitTestFromEdge(string? edge) => edge switch
    {
        "w" => 10, "e" => 11, "n" => 12, "nw" => 13, "ne" => 14,
        "s" => 15, "sw" => 16, "se" => 17,
        _ => 0,
    };

    // 최대화 시 보이지 않는 리사이즈 테두리만큼 창이 화면 밖으로 나가는 것을 보정 + 웹에 상태 통지
    private void OnWindowStateChanged(object? sender, EventArgs e)
    {
        Root.Margin = WindowState == WindowState.Maximized ? new Thickness(8) : new Thickness(0);
        SendToWeb(new { cmd = "winstate", maximized = WindowState == WindowState.Maximized });
    }

    // 앱 테마에 맞춰 Windows 제목표시줄도 어둡게/밝게 (시스템 설정과 무관하게 항상 일치)
    private void ApplyTitleBarTheme(string theme)
    {
        if (theme is not ("dark" or "light")) return;
        var hwnd = new System.Windows.Interop.WindowInteropHelper(this).Handle;
        if (hwnd == IntPtr.Zero) return;
        var dark = theme == "dark" ? 1 : 0;
        _ = DwmSetWindowAttribute(hwnd, DwmaUseImmersiveDarkMode, ref dark, sizeof(int));   // 미지원 OS → 무시됨
    }

    // 명령줄 인자로 받은 파일 경로들 (첫 인스턴스가 App에서 주입)
    public void SetStartupFiles(IEnumerable<string> paths) => _startupFiles.AddRange(paths);

    // 후속 인스턴스가 파이프로 넘긴 파일(들) → 창을 앞으로 가져오고 각각 새 탭으로 연다
    public void OpenExternalFiles(IEnumerable<string> paths)
    {
        if (WindowState == WindowState.Minimized) WindowState = WindowState.Normal;
        Activate();
        Topmost = true; Topmost = false;          // 잠깐 최상위 → 포커스 확보

        foreach (var path in paths)
        {
            if (string.IsNullOrEmpty(path) || !File.Exists(path)) continue;
            if (_webReady) LoadFile(path);
            else _pendingFiles.Add(path);         // 아직 웹이 준비 전이면 대기열에
        }
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        try
        {
            // 완전 독립형: exe 옆 Runtime\ 폴더에 번들된 고정 버전 WebView2가 있으면 그것을 사용
            // (없으면 null → 시스템에 설치된 Evergreen 런타임 사용)
            var runtimeDir = Path.Combine(AppContext.BaseDirectory, "Runtime");
            var browserFolder = !IsInstalledEdition && File.Exists(Path.Combine(runtimeDir, "msedgewebview2.exe"))
                ? runtimeDir
                : null;

            // 포터블: WebView2 데이터 폴더도 exe 옆에 둔다 (시스템에 흔적 없음)
            var env = await CoreWebView2Environment.CreateAsync(browserFolder, DataDir, null);
            await Web.EnsureCoreWebView2Async(env);

            var core = Web.CoreWebView2;

            // Ctrl+휠로 조절한 줌 배율을 기억해 다음 실행에도 유지
            RestoreZoom();
            Web.ZoomFactorChanged += (_, _) => QueueZoomSave();

            // web/ 폴더를 가상 호스트로 매핑 → https://app.md.local/index.html
            var webRoot = Path.Combine(AppContext.BaseDirectory, "web");
            core.SetVirtualHostNameToFolderMapping(
                VirtualHost, webRoot, CoreWebView2HostResourceAccessKind.Allow);

            // 배포용: 우클릭 메뉴/개발자도구 비활성 (디버그 시 주석 처리)
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.AreDevToolsEnabled = false;
            // 앱 셸로 동작: F5/Ctrl+R(새로고침 시 열린 탭·미저장 편집 전부 소실)·Ctrl+P 등
            // 브라우저 단축키 차단. 편집 단축키(Ctrl+C/V/Z)와 페이지 스크립트 단축키는 영향 없음.
            core.Settings.AreBrowserAcceleratorKeysEnabled = false;
            core.Settings.IsSwipeNavigationEnabled = false;    // 터치 스와이프 뒤로가기로 페이지 이탈 방지
            core.Settings.IsStatusBarEnabled = false;          // 링크 호버 시 좌하단 URL 말풍선 제거
            core.Settings.IsGeneralAutofillEnabled = false;    // 편집기·찾기창에 브라우저 자동완성 차단
            core.Settings.IsPasswordAutosaveEnabled = false;

            // 우클릭 메뉴의 "붙여넣기"(navigator.clipboard.readText)만 자동 허용 — 나머지 권한은 조용히 거부
            core.PermissionRequested += (_, pe) =>
            {
                pe.State = pe.PermissionKind == CoreWebView2PermissionKind.ClipboardRead
                    ? CoreWebView2PermissionState.Allow
                    : CoreWebView2PermissionState.Deny;
            };

            core.WebMessageReceived += OnWebMessage;
            // 앱 페이지 밖으로의 내비게이션 차단 (URL 드래그 등으로 앱 화면이 대체되는 것 방지)
            core.NavigationStarting += (_, a) =>
            {
                if (!a.Uri.StartsWith($"https://{VirtualHost}/", StringComparison.OrdinalIgnoreCase))
                    a.Cancel = true;
            };
            core.Navigate($"https://{VirtualHost}/index.html");
        }
        catch (Exception ex)
        {
            // WebView2 런타임을 찾지 못했거나 초기화 실패 → 조용한 크래시 대신 안내
            MessageBox.Show(this, Loc.WebViewInitError(ex.Message),
                "MarkDownEditor", MessageBoxButton.OK, MessageBoxImage.Error);
            Close();
        }
    }

    private void OnWebMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        JsonElement msg;
        try { msg = JsonSerializer.Deserialize<JsonElement>(e.WebMessageAsJson); }
        catch { return; }
        if (msg.ValueKind != JsonValueKind.Object) return;   // 비객체 메시지(문자열·숫자 등) 무시

        // 웹 측 사소한 타입 불일치(GetInt32 등)가 UI 스레드 미처리 예외 → 앱 크래시가 되지 않게 방어
        try { HandleWebMessage(msg, e); }
        catch { /* 잘못된 메시지는 버림 */ }
    }

    private void HandleWebMessage(JsonElement msg, CoreWebView2WebMessageReceivedEventArgs e)
    {
        var cmd = msg.TryGetProperty("cmd", out var c) ? c.GetString() : null;
        switch (cmd)
        {
            case "ready":
                _webReady = true;
                // 확정 언어(설정 > MDE_LANG > OS)와 버전을 웹에 전달 — UI 문자열·정보 표시에 사용
                SendToWeb(new { cmd = "app", version = AppVersion, lang = Loc.Lang, langMode = Loc.Mode });
                SendToWeb(new { cmd = "winstate", maximized = WindowState == WindowState.Maximized });
                LoadStartupFiles();
                foreach (var p in _pendingFiles) LoadFile(p);   // 준비 전 도착분 반영
                _pendingFiles.Clear();
                HideSplash();
                Web.Focus();   // 실행 직후 클릭 없이도 단축키·키 스크롤이 동작하도록 키보드 포커스 부여
                _ = StartupUpdateFlowAsync();   // 잔재 정리 + 조용한 업데이트 확인 (실패 무시)
                break;
            case "theme":
                var themeName = msg.TryGetProperty("value", out var th) ? th.GetString() ?? "" : "";
                SaveTheme(themeName);
                ApplyTitleBarTheme(themeName);   // 제목표시줄도 함께 전환
                break;
            case "lang":
                // 언어 메뉴 선택 → 저장 후 확정값 회신 (웹이 UI 문자열 재적용)
                Loc.Set(msg.TryGetProperty("value", out var lv) ? lv.GetString() : null);
                SendToWeb(new { cmd = "app", version = AppVersion, lang = Loc.Lang, langMode = Loc.Mode });
                break;
            case "open":
                OpenViaDialog();
                break;
            case "openPath":
                // 최근 문서/세션 복원이 요청한 경로 — 없어진 파일이면 웹에 알려 목록에서 지움
                var opPath = msg.TryGetProperty("path", out var op) ? op.GetString() : null;
                var opQuiet = msg.TryGetProperty("quiet", out var oq) && oq.GetBoolean();
                if (!string.IsNullOrWhiteSpace(opPath))
                {
                    if (File.Exists(opPath)) LoadFile(opPath);
                    else SendToWeb(new { cmd = "pathMissing", path = opPath, quiet = opQuiet });
                }
                break;
            case "openLink":
                OpenLinkedFile(
                    msg.TryGetProperty("href", out var hf) ? hf.GetString() : null,
                    msg.TryGetProperty("base", out var bs) ? bs.GetString() : null);
                break;
            case "openExternal":
                OpenExternal(msg.TryGetProperty("url", out var u) ? u.GetString() : null);
                break;
            case "exportPdf":
                _ = ExportPdfAsync(msg.TryGetProperty("name", out var pn) ? pn.GetString() : null);
                break;
            case "printThemeReady":
                _printReady?.TrySetResult(true);
                break;
            case "drop":
                OpenDroppedFiles(e.AdditionalObjects);
                break;
            case "reveal":
                RevealInExplorer(msg.TryGetProperty("path", out var rvp) ? rvp.GetString() : null);
                break;
            case "pasteImage":
                SavePastedImage(
                    msg.TryGetProperty("id", out var pi) ? pi.GetInt32() : -1,
                    msg.TryGetProperty("base", out var pbs) ? pbs.GetString() : null,
                    msg.TryGetProperty("type", out var pty) ? pty.GetString() : null,
                    msg.TryGetProperty("data", out var pda) ? pda.GetString() : null);
                break;
            case "save":
                Save(
                    msg.TryGetProperty("id", out var sid) ? sid.GetInt32() : -1,
                    msg.TryGetProperty("request", out var sr) ? sr.GetInt32() : 0,
                    msg.TryGetProperty("path", out var sp) ? sp.GetString() : null,
                    msg.TryGetProperty("text", out var t) ? t.GetString() ?? "" : "");
                break;
            case "state":
                UpdateState(msg);
                break;
            // ---- 커스텀 타이틀바 창 제어 ----
            case "windrag":
                BeginNativeDrag(2);                    // HTCAPTION — 창 이동 (최대화 상태면 OS가 복원 후 드래그)
                break;
            case "winresize":
                var ht = HitTestFromEdge(msg.TryGetProperty("edge", out var eg) ? eg.GetString() : null);
                if (ht != 0 && WindowState == WindowState.Normal) BeginNativeDrag(ht);
                break;
            case "winmin":
                WindowState = WindowState.Minimized;
                break;
            case "winmax":
                WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
                break;
            case "winclose":
                Close();
                break;
            // ---- 자동 업데이트 (MainWindow.Update.cs) ----
            case "updateCheck":
                _ = CheckForUpdateAsync(manual: true);
                break;
            case "updateApply":
                _ = ApplyUpdateAsync();
                break;
        }
    }

    private void LoadStartupFiles()
    {
        // 명령줄로 받은 파일들을 각각 탭으로 열고, 하나도 없으면 빈 새 문서 탭 하나
        var opened = 0;
        foreach (var f in _startupFiles)
            if (File.Exists(f)) { LoadFile(f); opened++; }

        if (opened == 0)   // 파일 없이 실행 → 빈 새 문서 (웹이 startupBlank를 보고 세션 복원 시도)
            SendToWeb(new { cmd = "load", path = (string?)null, name = Loc.NewDoc, text = "", startupBlank = true });
    }

    // 어셈블리 버전 → "1.0.0" 형태 (웹의 정보 표시용)
    private static string AppVersion =>
        typeof(MainWindow).Assembly.GetName().Version is { } v ? $"{v.Major}.{v.Minor}.{v.Build}" : "0.0.0";

    private void OpenViaDialog()
    {
        // 여러 개 선택 시 각각 새 탭으로
        var dlg = new OpenFileDialog
        {
            Filter = Loc.FilterOpen,
            CheckFileExists = true,
            Multiselect = true
        };
        if (dlg.ShowDialog(this) == true)
            foreach (var f in dlg.FileNames) LoadFile(f);
    }

    // 셸 연결 프로그램으로 열기 (브라우저·탐색기 등)
    private static void ShellOpen(string target)
    {
        try { Process.Start(new ProcessStartInfo(target) { UseShellExecute = true }); }
        catch { /* 연결 프로그램 없음 등 → 무시 */ }
    }

    // 탐색기에서 파일 위치 열기 (해당 파일 선택 상태)
    private static void RevealInExplorer(string? path)
    {
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path)) return;
        try { Process.Start("explorer.exe", $"/select,\"{Path.GetFullPath(path)}\""); }
        catch { }
    }

    // 미리보기의 외부 링크(웹·메일·전화) 클릭 → 기본 브라우저/연결 프로그램으로
    private static void OpenExternal(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return;
        // 허용된 스킴만 셸로 넘김 (임의 프로그램 실행 방지)
        if (Regex.IsMatch(url, @"^(https?:|mailto:|tel:)", RegexOptions.IgnoreCase)) ShellOpen(url);
    }

    // 미리보기의 로컬 링크 클릭 → 현재 문서 폴더 기준으로 경로를 풀어
    // 마크다운은 새 탭으로, HTML은 기본 브라우저로, 폴더는 탐색기로
    private void OpenLinkedFile(string? href, string? basePath)
    {
        if (string.IsNullOrWhiteSpace(href)) return;
        try
        {
            // 웹 외 스킴(file:, javascript: 등)은 무시 — 2글자 이상 스킴만 걸러 드라이브 문자(C:)와 구분
            if (Regex.IsMatch(href, @"^[a-zA-Z][a-zA-Z0-9+.\-]+:")) return;

            var rel = Uri.UnescapeDataString(href.Split('#', '?')[0]).Trim();
            if (rel.Length == 0) return;

            // #앵커는 파일을 연 뒤 웹이 해당 헤딩으로 스크롤하도록 함께 전달
            var hashIdx = href.IndexOf('#');
            var anchor = hashIdx >= 0 && hashIdx < href.Length - 1 ? href[(hashIdx + 1)..] : null;

            string full;
            if (Path.IsPathRooted(rel))
                full = Path.GetFullPath(rel);
            else if (!string.IsNullOrEmpty(basePath))
                full = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(basePath)!, rel));
            else
                return;                            // 상대 경로인데 기준 문서가 저장 전이면 열 수 없음

            if (Directory.Exists(full))            // 폴더 링크 → 탐색기로
            {
                ShellOpen(full);
                return;
            }
            if (!File.Exists(full))
            {
                MessageBox.Show(this, Loc.LinkNotFound(full), Loc.CapLink,
                    MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            var ext = Path.GetExtension(full).ToLowerInvariant();
            if (ext is ".md" or ".markdown" or ".txt")
                LoadFile(full, anchor);
            else if (ext is ".html" or ".htm")
                ShellOpen(full);                   // 브라우저로
            else if (ext is ".pdf" or ".doc" or ".docx" or ".xls" or ".xlsx" or ".ppt" or ".pptx"
                     or ".hwp" or ".csv" or ".png" or ".jpg" or ".jpeg" or ".gif" or ".webp" or ".zip")
                ShellOpen(full);                   // 문서·이미지·압축은 연결 프로그램으로 (허용 목록)
            // 그 외 형식(exe/bat 등)은 열지 않음 — 링크 클릭으로 임의 실행 방지
        }
        catch { }
    }

    // 드래그&드롭된 파일들 (JS가 WebView2 전용 API로 실제 경로를 전달) → 마크다운/텍스트만 탭으로
    private void OpenDroppedFiles(IReadOnlyList<object>? objects)
    {
        if (objects == null) return;
        foreach (var obj in objects)
        {
            if (obj is not CoreWebView2File f || !File.Exists(f.Path)) continue;
            if (Path.GetExtension(f.Path).ToLowerInvariant() is ".md" or ".markdown" or ".txt")
                LoadFile(f.Path);
        }
    }

    // 미리보기를 PDF로 내보내기 (@media print 스타일 적용 — 앱 UI 숨김·라이트 테마 강제)
    private bool _exporting;   // 내보내기 진행 중 재진입 방지 (대기 중 버튼 재클릭 등)

    private async Task ExportPdfAsync(string? docName)
    {
        var core = Web.CoreWebView2;
        if (core == null || _exporting) return;

        var baseName = string.IsNullOrWhiteSpace(docName) ? Loc.DocDefault : Path.GetFileNameWithoutExtension(docName);
        var dlg = new SaveFileDialog
        {
            Filter = "PDF (*.pdf)|*.pdf",
            DefaultExt = ".pdf",
            FileName = baseName + ".pdf"
        };
        if (dlg.ShowDialog(this) != true) return;

        _exporting = true;
        try
        {
            // 다크 테마여도 PDF는 항상 라이트: mermaid를 라이트로 재렌더시키고 완료 신호 대기 (최대 2초)
            _printReady = new TaskCompletionSource<bool>();
            SendToWeb(new { cmd = "printTheme", mode = "light" });
            await Task.WhenAny(_printReady.Task, Task.Delay(2000));

            var settings = core.Environment.CreatePrintSettings();
            settings.ShouldPrintBackgrounds = true;    // 코드 블록·다이어그램 배경 유지
            var ok = await core.PrintToPdfAsync(dlg.FileName, settings);
            if (ok)
                SendToWeb(new { cmd = "toast", text = Loc.PdfSaved(Path.GetFileName(dlg.FileName)) });
            else
                MessageBox.Show(this, Loc.PdfFailed, "PDF",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, Loc.PdfError(ex.Message), "PDF",
                MessageBoxButton.OK, MessageBoxImage.Warning);
        }
        finally
        {
            _printReady = null;
            _exporting = false;
            SendToWeb(new { cmd = "printTheme", mode = "restore" });   // 화면을 원래 테마로 복원
        }
    }

    // 붙여넣은 클립보드 이미지 → 문서 옆 images/ 폴더에 저장하고 상대 경로 + 미리보기용 data URI 회신
    private async void SavePastedImage(int id, string? basePath, string? mime, string? b64)
    {
        if (id < 0 || string.IsNullOrEmpty(basePath) || string.IsNullOrEmpty(b64)) return;
        try
        {
            var ext = mime?.ToLowerInvariant() switch
            {
                "image/png" => ".png",
                "image/jpeg" => ".jpg",
                "image/gif" => ".gif",
                "image/webp" => ".webp",
                "image/bmp" => ".bmp",
                _ => null,
            };
            if (ext == null) return;               // 알 수 없는 형식은 무시

            // 대용량 스크린샷의 base64 디코드·파일 쓰기가 UI를 멈추지 않게 백그라운드에서 수행
            var full = await Task.Run(() =>
            {
                var bytes = Convert.FromBase64String(b64);
                var dir = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(basePath))!, "images");
                Directory.CreateDirectory(dir);

                var stem = $"img_{DateTime.Now:yyyyMMdd_HHmmss}";
                var p = Path.Combine(dir, stem + ext);
                for (var n = 1; File.Exists(p); n++)
                    p = Path.Combine(dir, $"{stem}_{n}{ext}");
                File.WriteAllBytes(p, bytes);
                return p;
            });

            SendToWeb(new
            {
                cmd = "imageSaved",
                id,
                src = "images/" + Path.GetFileName(full),
                dataUri = $"data:{mime};base64,{b64}",
            });
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, Loc.ImgSaveError(ex.Message), Loc.CapImage,
                MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    // 여러 파일을 연달아 열 때 완료 순서가 뒤섞이지 않도록 로드를 체인으로 직렬화
    private Task _loadChain = Task.CompletedTask;

    private void LoadFile(string path, string? anchor = null)
    {
        var prev = _loadChain;
        _loadChain = LoadFileCore(prev, path, anchor);
    }

    private async Task LoadFileCore(Task prev, string path, string? anchor)
    {
        try { await prev; } catch { /* 앞선 로드 실패는 이미 알림됨 */ }
        try
        {
            var full = Path.GetFullPath(path);
            // 인코딩 감지·이미지 base64 인라인은 파일 크기에 비례 → UI 스레드 밖에서 수행 (창 멈춤 방지)
            var (text, imgMap) = await Task.Run(() =>
            {
                var t = ReadTextDetectEncoding(full);
                return (t, BuildImageMap(t, Path.GetDirectoryName(full) ?? ""));
            });
            // 웹이 같은 경로가 이미 열려 있으면 그 탭으로 이동, 없으면 새 탭 생성
            // anchor가 있으면 연 뒤 해당 헤딩으로 스크롤 (문서 간 #섹션 링크)
            SendToWeb(new { cmd = "load", path = full, name = Path.GetFileName(full), text, imgMap, anchor });
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, Loc.OpenError(ex.Message), Loc.CapError,
                MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    // 문서의 이미지 참조(상대·절대 경로)를 읽어 data URI로 인라인
    // { 원본src : "data:<mime>;base64,..." }. 원격(http/https/data)·앵커·미존재 파일은 제외.
    private static Dictionary<string, string>? BuildImageMap(string text, string docDir)
    {
        var map = new Dictionary<string, string>();

        void Add(string raw)
        {
            raw = raw.Trim();
            if (raw.Length == 0 || map.ContainsKey(raw)) return;
            if (raw.StartsWith('#') || Regex.IsMatch(raw, @"^(https?:|data:)", RegexOptions.IgnoreCase)) return;
            try
            {
                var p = raw;
                if (p.StartsWith("file:///", StringComparison.OrdinalIgnoreCase)) p = new Uri(p).LocalPath;
                p = Uri.UnescapeDataString(p);
                var full = Path.IsPathRooted(p)
                    ? Path.GetFullPath(p)
                    : Path.GetFullPath(Path.Combine(docDir, p));
                if (!File.Exists(full)) return;

                var mime = MimeFromExtension(Path.GetExtension(full));
                if (mime == null) return;                              // 이미지 확장자만
                if (new FileInfo(full).Length > 20 * 1024 * 1024) return;   // 20MB 초과는 건너뜀
                var bytes = File.ReadAllBytes(full);
                map[raw] = $"data:{mime};base64,{Convert.ToBase64String(bytes)}";
            }
            catch { /* 경로 형식 오류·읽기 실패 → 해당 이미지만 건너뜀 */ }
        }

        foreach (Match m in MdImageRegex.Matches(text)) Add(m.Groups["src"].Value);
        foreach (Match m in HtmlImageRegex.Matches(text)) Add(m.Groups["src"].Value);
        return map.Count > 0 ? map : null;
    }

    private static string? MimeFromExtension(string ext) => ext.ToLowerInvariant() switch
    {
        ".png" => "image/png",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".gif" => "image/gif",
        ".webp" => "image/webp",
        ".svg" => "image/svg+xml",
        ".bmp" => "image/bmp",
        ".ico" => "image/x-icon",
        _ => null,
    };

    // ---- 로딩 스플래시 / 테마 ----

    private void HideSplash()
    {
        if (Splash.Visibility != Visibility.Visible) return;
        var fade = new DoubleAnimation(1, 0, TimeSpan.FromMilliseconds(180));
        fade.Completed += (_, _) => Splash.Visibility = Visibility.Collapsed;
        Splash.BeginAnimation(OpacityProperty, fade);
    }

    private void ApplySplashTheme(string theme)
    {
        var dark = theme == "dark";
        var bg = Brush(dark ? "#0d1117" : "#ffffff");
        Background = bg;                 // 창 배경 (WebView2 부팅 갭에 노출됨)
        Splash.Background = bg;
        // 네비게이션 완료 전 WebView2 기본 배경(흰색)도 테마색으로 → 스플래시 걷힐 때 깜빡임 방지
        Web.DefaultBackgroundColor = dark
            ? System.Drawing.Color.FromArgb(0x0d, 0x11, 0x17)
            : System.Drawing.Color.FromArgb(0xff, 0xff, 0xff);
        SplashTitle.Foreground = Brush(dark ? "#e6edf3" : "#24292f");
        SplashSub.Foreground = Brush(dark ? "#8b949e" : "#6e7781");
        SplashSpinner.Stroke = Brush(dark ? "#4493f8" : "#0969da");
        SplashTrack.Stroke = Brush(dark ? "#30363d" : "#d0d7de");
    }

    private static SolidColorBrush Brush(string hex)
        => new((Color)ColorConverter.ConvertFromString(hex)!);

    // 마지막으로 선택한 테마 → 없으면 시스템(앱) 테마 → 없으면 라이트
    private static string ResolveInitialTheme()
    {
        try
        {
            if (File.Exists(ThemeFile))
            {
                var s = File.ReadAllText(ThemeFile).Trim();
                if (s is "dark" or "light") return s;
            }
        }
        catch { }
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(
                @"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize");
            if (key?.GetValue("AppsUseLightTheme") is int light) return light == 0 ? "dark" : "light";
        }
        catch { }
        return "light";
    }

    private static void SaveTheme(string theme)
    {
        if (theme is not ("dark" or "light")) return;
        try { File.WriteAllText(ThemeFile, theme); } catch { }
    }

    // ---- 줌 배율 기억 (Ctrl+휠) ----
    private static string ZoomFile => Path.Combine(DataDir, "zoom.txt");
    private System.Windows.Threading.DispatcherTimer? _zoomTimer;

    private void RestoreZoom()
    {
        try
        {
            if (!File.Exists(ZoomFile)) return;
            if (double.TryParse(File.ReadAllText(ZoomFile).Trim(),
                    System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out var z)
                && z is >= 0.25 and <= 5.0)
                Web.ZoomFactor = z;
        }
        catch { /* 손상된 값 → 기본 배율 */ }
    }

    private void QueueZoomSave()   // 휠 틱마다 파일 쓰기 방지 (500ms 디바운스)
    {
        _zoomTimer ??= CreateZoomTimer();
        _zoomTimer.Stop();
        _zoomTimer.Start();
    }

    private System.Windows.Threading.DispatcherTimer CreateZoomTimer()
    {
        var t = new System.Windows.Threading.DispatcherTimer { Interval = TimeSpan.FromMilliseconds(500) };
        t.Tick += (_, _) =>
        {
            t.Stop();
            try
            {
                File.WriteAllText(ZoomFile,
                    Web.ZoomFactor.ToString(System.Globalization.CultureInfo.InvariantCulture));
            }
            catch { }
        };
        return t;
    }

    private static string ResolveDataDir()
    {
        // 설치판은 프로그램 파일과 사용자 데이터를 분리해 업데이트·제거 때 설정과 복구 데이터가 보존되게 한다.
        if (IsInstalledEdition)
        {
            var installed = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MarkDownEditor");
            Directory.CreateDirectory(installed);
            return installed;
        }

        // exe 옆의 WebView2Data 폴더를 우선 사용, 쓰기 불가 시 임시폴더로 폴백
        var beside = Path.Combine(AppContext.BaseDirectory, "WebView2Data");
        try
        {
            Directory.CreateDirectory(beside);
            var probe = Path.Combine(beside, ".writable");
            File.WriteAllText(probe, "");
            File.Delete(probe);
            return beside;
        }
        catch
        {
            var tmp = Path.Combine(Path.GetTempPath(), "MarkDownEditor");
            Directory.CreateDirectory(tmp);
            return tmp;
        }
    }

    private async void Save(int id, int request, string? path, string text)
    {
        // 경로가 없으면 (새 문서) 다른 이름으로 저장
        if (string.IsNullOrEmpty(path))
        {
            var dlg = new SaveFileDialog
            {
                Filter = Loc.FilterSave,
                DefaultExt = ".md",
                FileName = Loc.NewDoc + ".md"
            };
            if (dlg.ShowDialog(this) != true) return;
            path = dlg.FileName;
        }

        try
        {
            var full = Path.GetFullPath(path);
            // 같은 파일에 저장 요청이 겹쳐도 요청 순서대로 기록한다. 이전 저장보다 오래된 내용이
            // 마지막에 덮어쓰는 경쟁 상태를 막고, 서로 다른 파일 저장은 계속 병렬로 처리한다.
            var previous = _saveChains.TryGetValue(full, out var pending) ? pending : Task.CompletedTask;
            var current = SaveFileQueuedAsync(previous, full, text);
            _saveChains[full] = current;
            Dictionary<string, string>? imgMap;
            try
            {
                imgMap = await current;
            }
            finally
            {
                if (_saveChains.TryGetValue(full, out var latest) && ReferenceEquals(latest, current))
                    _saveChains.Remove(full);
            }
            // 요청 번호를 되돌려줘 웹이 겹친 저장 응답 중 최신 요청만 상태에 반영하게 한다.
            SendToWeb(new { cmd = "saved", id, request, path = full, name = Path.GetFileName(full), imgMap });
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, Loc.SaveError(ex.Message), Loc.CapError,
                MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private static async Task<Dictionary<string, string>?> SaveFileQueuedAsync(Task previous, string full, string text)
    {
        try { await previous.ConfigureAwait(false); }
        catch { /* 앞선 저장 실패가 다음 저장까지 막지는 않음 */ }

        return await Task.Run(() =>
        {
            // 임시 파일에 쓴 뒤 교체 — 쓰기 도중 크래시·전원 차단에도 원본이 잘린 채 남지 않게 (UTF-8, BOM 없음)
            var tmp = full + ".mde-tmp";
            try
            {
                File.WriteAllText(tmp, text, new UTF8Encoding(false));
                File.Move(tmp, full, overwrite: true);
            }
            finally
            {
                if (File.Exists(tmp)) try { File.Delete(tmp); } catch { }
            }
            // 저장 본문 기준으로 이미지 맵 재생성 → 편집 중 추가한 로컬 이미지가 미리보기에 반영됨
            return BuildImageMap(text, Path.GetDirectoryName(full) ?? "");
        }).ConfigureAwait(false);
    }

    // 웹이 활성 탭/변경 상태를 알려옴 → 창 제목 + 닫기 가드 + 외부 변경 감시 대상 갱신
    private void UpdateState(JsonElement msg)
    {
        _anyDirty = msg.TryGetProperty("anyDirty", out var ad) && ad.GetBoolean();
        var name = msg.TryGetProperty("name", out var n) ? n.GetString() : null;
        var activeDirty = msg.TryGetProperty("activeDirty", out var acd) && acd.GetBoolean();
        Title = (activeDirty ? "● " : "") + (string.IsNullOrEmpty(name) ? Loc.NewDoc : name) + " — Markdown";

        if (msg.TryGetProperty("paths", out var ps) && ps.ValueKind == JsonValueKind.Array)
        {
            var list = new List<string>();
            foreach (var p in ps.EnumerateArray())
                if (p.GetString() is { Length: > 0 } s) list.Add(s);
            SyncWatchers(list);
        }
    }

    // ---- 외부 변경 감지 ----

    // 열린 파일 목록에 맞춰 폴더 감시자를 만들고/치움
    private void SyncWatchers(List<string> paths)
    {
        _watchedFiles.Clear();
        foreach (var p in paths)
            try { _watchedFiles.Add(Path.GetFullPath(p)); } catch { }

        var dirs = _watchedFiles
            .Select(f => Path.GetDirectoryName(f))
            .Where(d => !string.IsNullOrEmpty(d))
            .Select(d => d!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        foreach (var dir in _watchers.Keys.Where(d => !dirs.Contains(d, StringComparer.OrdinalIgnoreCase)).ToList())
        {
            _watchers[dir].Dispose();
            _watchers.Remove(dir);
        }
        foreach (var dir in dirs)
        {
            if (_watchers.ContainsKey(dir)) continue;
            try
            {
                var w = new FileSystemWatcher(dir)
                {
                    NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.Size,
                    InternalBufferSize = 64 * 1024,   // 기본 8KB → 이벤트 폭주(대량 파일 작업) 시 유실 방지
                };
                w.Changed += OnWatchedFileEvent;
                w.Created += OnWatchedFileEvent;                       // 임시파일 교체 저장(VS Code 등) 대응
                w.Renamed += (_, e) => OnWatchedFileEvent(w, e);
                w.EnableRaisingEvents = true;
                _watchers[dir] = w;
            }
            catch { /* 감시 불가 위치(권한 등) → 해당 폴더만 자동 갱신 생략 */ }
        }
    }

    // 감시 이벤트는 스레드풀에서 오므로 UI 스레드로 넘긴 뒤 디바운스
    // _watchedFiles 판정도 UI 스레드에서 — SyncWatchers(UI)와의 동시 접근(HashSet 미정의 동작) 방지
    private void OnWatchedFileEvent(object? sender, FileSystemEventArgs e)
    {
        string full;
        try { full = Path.GetFullPath(e.FullPath); } catch { return; }
        Dispatcher.BeginInvoke(() =>
        {
            if (_watchedFiles.Contains(full)) QueueReload(full);
        });
    }

    // 저장 도구들이 이벤트를 연달아 쏘므로 500ms 잠잠해진 뒤 한 번만 처리
    private void QueueReload(string path)
    {
        if (_reloadTimers.TryGetValue(path, out var t)) { t.Stop(); t.Start(); return; }
        var timer = new System.Windows.Threading.DispatcherTimer { Interval = TimeSpan.FromMilliseconds(500) };
        timer.Tick += (_, _) =>
        {
            timer.Stop();
            _reloadTimers.Remove(path);
            NotifyFileChanged(path);
        };
        _reloadTimers[path] = timer;
        timer.Start();
    }

    private async void NotifyFileChanged(string path)
    {
        if (!File.Exists(path)) return;                    // 삭제/이동은 열린 탭을 그대로 둠
        try
        {
            var (text, imgMap) = await Task.Run(() =>      // 재읽기도 UI 스레드 밖에서
            {
                var t = ReadTextDetectEncoding(path);
                return (t, BuildImageMap(t, Path.GetDirectoryName(path) ?? ""));
            });
            SendToWeb(new { cmd = "fileChanged", path, name = Path.GetFileName(path), text, imgMap });
        }
        catch { /* 다른 프로그램이 아직 쓰는 중(잠금) → 보통 후속 이벤트에서 재시도됨 */ }
    }

    private bool _closeConfirmShowing;   // 확인 창이 떠 있는 동안 오는 추가 닫기 요청 무시 (동일 팝업 중복 방지)

    private void OnClosing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        if (_anyDirty)
        {
            if (_closeConfirmShowing) { e.Cancel = true; }
            else
            {
                _closeConfirmShowing = true;
                try
                {
                    var r = MessageBox.Show(this, Loc.CloseConfirm, Loc.CapConfirm,
                        MessageBoxButton.YesNo, MessageBoxImage.Question);
                    if (r != MessageBoxResult.Yes) e.Cancel = true;
                }
                finally { _closeConfirmShowing = false; }
            }
        }
        if (e.Cancel) CancelPendingApply();   // 업데이트로 시작된 종료가 취소됨 → 적용 보류 해제
    }

    private void SendToWeb(object payload)
    {
        var json = JsonSerializer.Serialize(payload);
        Web.CoreWebView2?.PostWebMessageAsJson(json);
    }

    private static string ReadTextDetectEncoding(string path)
    {
        var bytes = File.ReadAllBytes(path);

        // BOM이 있으면 그대로 신뢰 (UTF-8 / UTF-16 LE·BE)
        if (bytes.Length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF)
            return Encoding.UTF8.GetString(bytes, 3, bytes.Length - 3);
        if (bytes.Length >= 2 && bytes[0] == 0xFF && bytes[1] == 0xFE)
            return Encoding.Unicode.GetString(bytes, 2, bytes.Length - 2);
        if (bytes.Length >= 2 && bytes[0] == 0xFE && bytes[1] == 0xFF)
            return Encoding.BigEndianUnicode.GetString(bytes, 2, bytes.Length - 2);

        // BOM 없음: 엄격 UTF-8 시도 → 유효하지 않으면 CP949(EUC-KR)로 폴백해 한글 깨짐 방지
        try
        {
            return new UTF8Encoding(false, throwOnInvalidBytes: true).GetString(bytes);
        }
        catch (DecoderFallbackException)
        {
            try { return Encoding.GetEncoding(949).GetString(bytes); }
            catch { return Encoding.UTF8.GetString(bytes); }   // 코드페이지 미지원 환경 → 관용 UTF-8
        }
    }
}
