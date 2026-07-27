using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace MarkDownEditor;

// ---- 자동 업데이트 (TODO.md 설계) ----
// 확인: GitHub 릴리즈 API (시작 시 조용히 1회 + 팝업의 "지금 확인").
// 적용: zip을 %TEMP%에 다운로드 → 앱 폴더 안 .update\payload에 압축 해제(같은 볼륨이라
//       도우미가 rename만으로 교체) → 평소 종료 절차를 거쳐 종료가 "확정"된 뒤(Closed)에만
//       도우미 스크립트 실행. WebView2Data\는 절대 건드리지 않는다.
public partial class MainWindow
{
    private const string UpdateApiDefault = "https://api.github.com/repos/jjw1270/MarkdownEditor/releases/latest";
    private const string UpdateAssetName = "MarkDownEditor-standalone.zip";
    private const string UpdateReleasesPage = "https://github.com/jjw1270/MarkdownEditor/releases/latest";
    private static readonly string[] UpdateItems = { "web", "Runtime", "MarkDownEditor.exe" };   // 교체 대상 (exe 마지막)

    private sealed record UpdateInfo(Version Latest, string Notes, string ZipUrl, long ZipSize);

    private UpdateInfo? _updateAvail;     // 마지막 확인에서 발견한 새 버전 (없으면 null)
    private bool _updateBusy;             // 확인/다운로드 재진입 방지
    private string? _updateHelper;        // 준비된 도우미 스크립트 경로
    private Version? _payloadVersion;     // .update\payload에 준비된 버전 (종료 취소 후 재클릭 시 재다운로드 생략)
    private bool _applyOnClose;           // 종료가 확정되면 도우미 스크립트를 실행

    private static readonly HttpClient UpdateHttp = CreateUpdateHttp();

    private static HttpClient CreateUpdateHttp()
    {
        var c = new HttpClient { Timeout = Timeout.InfiniteTimeSpan };   // 큰 zip 다운로드 — 시간 제한은 호출별 CTS로
        // GitHub API는 User-Agent 없는 요청을 403으로 거부함
        c.DefaultRequestHeaders.UserAgent.ParseAdd("MarkDownEditor/" + AppVersion);
        c.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
        return c;
    }

    private static string UpdateApiUrl
    {
        get
        {
#if DEBUG
            // 테스트용: 실제 릴리즈 없이도 목 API로 전체 흐름 검증 가능
            var o = Environment.GetEnvironmentVariable("MDE_UPDATE_API");
            if (!string.IsNullOrWhiteSpace(o)) return o;
#endif
            return UpdateApiDefault;
        }
    }

    private static Version CurrentVersion =>
        typeof(MainWindow).Assembly.GetName().Version is { } v ? new Version(v.Major, v.Minor, v.Build) : new(0, 0, 0);

    // ready 직후 1회: 지난 업데이트의 잔재 정리 → 조용한 자동 확인
    private async Task StartupUpdateFlowAsync()
    {
        await Task.Run(CleanupUpdateLeftovers);
        await Task.Delay(1500);   // 시작 직후 문서 로드와 경쟁하지 않게 살짝 늦춤
        await CheckForUpdateAsync(manual: false);
    }

    // 새 버전 확인. 실패는 조용히 무시하되, 수동 확인이면 팝업에 실패를 알린다.
    private async Task CheckForUpdateAsync(bool manual)
    {
        if (_updateBusy) return;
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(20));
            using var res = await UpdateHttp.GetAsync(UpdateApiUrl, cts.Token);
            if (res.StatusCode == HttpStatusCode.NotFound)
            {
                // 릴리즈가 아직 하나도 없음 → 오류가 아니라 "업데이트 없음"
                _updateAvail = null;
                SendUpdateStatus("latest");
                return;
            }
            res.EnsureSuccessStatusCode();

            using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync(cts.Token));
            var root = doc.RootElement;
            var tag = root.TryGetProperty("tag_name", out var t) ? t.GetString() ?? "" : "";
            if (!Version.TryParse(tag.TrimStart('v', 'V'), out var latest))
                throw new FormatException($"unexpected tag: {tag}");            // 태그 규칙(vX.Y.Z) 위반
            latest = new Version(latest.Major, Math.Max(latest.Minor, 0), Math.Max(latest.Build, 0));

            string zipUrl = ""; long zipSize = 0;
            if (root.TryGetProperty("assets", out var assets) && assets.ValueKind == JsonValueKind.Array)
                foreach (var a in assets.EnumerateArray())
                    if (a.TryGetProperty("name", out var n) &&
                        string.Equals(n.GetString(), UpdateAssetName, StringComparison.OrdinalIgnoreCase))
                    {
                        zipUrl = a.TryGetProperty("browser_download_url", out var u) ? u.GetString() ?? "" : "";
                        zipSize = a.TryGetProperty("size", out var sz) ? sz.GetInt64() : 0;
                        break;
                    }

            var notes = root.TryGetProperty("body", out var b) ? b.GetString() ?? "" : "";
            if (latest > CurrentVersion && zipUrl.Length > 0)
            {
                _updateAvail = new UpdateInfo(latest, notes, zipUrl, zipSize);
                SendUpdateStatus("available");
#if DEBUG
                // E2E 자동 테스트: 감지 즉시 UI 클릭 없이 적용 (무인 검증용, 디버그 빌드 한정)
                if (Environment.GetEnvironmentVariable("MDE_UPDATE_AUTOTEST") == "1")
                    _ = ApplyUpdateAsync();
#endif
            }
            else
            {
                _updateAvail = null;
                SendUpdateStatus("latest");
            }
        }
        catch
        {
            if (manual) SendUpdateStatus("error", reason: "net");
        }
    }

    // "업데이트하기": 다운로드(진행률) → 압축 해제 → 도우미 준비 → 평소 종료 절차로 종료
    private async Task ApplyUpdateAsync()
    {
        if (_updateBusy || _updateAvail is not { } info) return;

        // 직전에 종료를 취소했던 경우: 페이로드가 이미 준비돼 있으면 재다운로드 없이 바로 재시도
        if (_payloadVersion == info.Latest && _updateHelper != null && File.Exists(_updateHelper))
        {
            RequestApplyClose();
            return;
        }

        _updateBusy = true;
        try
        {
            var appDir = AppContext.BaseDirectory.TrimEnd('\\', '/');

            // 쓰기 권한 없는 위치(Program Files 등) → 자체 교체 불가, 릴리즈 페이지로 폴백
            if (!IsDirWritable(appDir))
            {
                ShellOpen(UpdateReleasesPage);
                SendUpdateStatus("fallback");
                return;
            }

            // 여유 공간: 임시 폴더엔 zip, 앱 폴더엔 압축 해제분(zip의 약 3배로 추정)
            if (info.ZipSize > 0 &&
                (FreeBytes(Path.GetTempPath()) < info.ZipSize + (100L << 20) ||
                 FreeBytes(appDir) < info.ZipSize * 3))
            {
                SendUpdateStatus("error", reason: "space");
                return;
            }

            // 1) 다운로드 (진행률 통지)
            SendUpdateProgress("download", 0);
            var tempZip = Path.Combine(Path.GetTempPath(), "MarkDownEditor-update.zip");
            using (var cts = new CancellationTokenSource(TimeSpan.FromMinutes(30)))
            {
                using var res = await UpdateHttp.GetAsync(info.ZipUrl, HttpCompletionOption.ResponseHeadersRead, cts.Token);
                res.EnsureSuccessStatusCode();
                var total = res.Content.Headers.ContentLength ?? info.ZipSize;
                await using var src = await res.Content.ReadAsStreamAsync(cts.Token);
                await using var dst = File.Create(tempZip);
                var buf = new byte[1 << 16];
                long done = 0; var lastPct = -1; int n;
                while ((n = await src.ReadAsync(buf, cts.Token)) > 0)
                {
                    await dst.WriteAsync(buf.AsMemory(0, n), cts.Token);
                    done += n;
                    var pct = total > 0 ? (int)(done * 100 / total) : -1;
                    if (pct != lastPct) { lastPct = pct; SendUpdateProgress("download", pct); }
                }
            }

            // 2) 앱 폴더 안 스테이징에 압축 해제 (같은 볼륨 → 도우미가 rename만으로 원자적 교체)
            SendUpdateProgress("extract", -1);
            var payload = Path.Combine(appDir, ".update", "payload");
            await Task.Run(() =>
            {
                var staging = Path.Combine(appDir, ".update");
                if (Directory.Exists(staging)) Directory.Delete(staging, recursive: true);
                Directory.CreateDirectory(payload);
                ZipFile.ExtractToDirectory(tempZip, payload);
                File.Delete(tempZip);
            });
            if (!File.Exists(Path.Combine(payload, "MarkDownEditor.exe")))
                throw new InvalidDataException("payload has no MarkDownEditor.exe");   // 잘못된 자산 구조

            // 3) 도우미 스크립트 생성 (%TEMP%)
            _updateHelper = WriteHelperScript(appDir, payload);
            _payloadVersion = info.Latest;

            // 4) 평소의 종료 절차(미저장 확인 포함)로 종료 — 확정된 뒤에만 도우미가 실행됨
            RequestApplyClose();
        }
        catch
        {
            SendUpdateStatus("error", reason: "apply");
            try { await Task.Run(CleanupUpdateLeftovers); } catch { }
        }
        finally { _updateBusy = false; }
    }

    private void RequestApplyClose()
    {
        _applyOnClose = true;
        SendUpdateProgress("ready", 100);
        Close();   // OnClosing이 미저장 확인을 수행; 취소되면 CancelPendingApply()가 호출됨
    }

    // 종료 확인에서 "아니요" → 적용 보류 해제.
    // 도우미를 미리 띄우지 않으므로 취소 후 평범한 종료에서 예고 없이 교체되는 일이 없다.
    private void CancelPendingApply()
    {
        if (!_applyOnClose) return;
        _applyOnClose = false;
        SendUpdateStatus("available");   // 팝업 버튼을 다시 활성화 (페이로드는 남겨 재클릭 시 즉시 적용)
    }

    // 종료가 확정된 뒤(Closed)에만 도우미 스크립트 실행
    private void LaunchHelperIfPending()
    {
        if (!_applyOnClose || _updateHelper == null || !File.Exists(_updateHelper)) return;
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = $"-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"{_updateHelper}\"",
                UseShellExecute = false,
                CreateNoWindow = true,
            });
        }
        catch { /* 도우미 실행 실패 → 이번 종료에선 업데이트를 건너뜀 (다음 실행에서 잔재 정리) */ }
    }

    // 도우미: 메인 프로세스 종료 대기 → 항목별 rename 교체(재시도) → 실패 시 원복 → 앱 재실행 → 자기 삭제
    private static string WriteHelperScript(string appDir, string payloadDir)
    {
        static string Q(string s) => "'" + s.Replace("'", "''") + "'";
        var script = $@"# MarkDownEditor 자동 업데이트 도우미 — 앱 종료 후 파일 교체, 완료 시 자기 자신 삭제
$ErrorActionPreference = 'Stop'
$app = {Q(appDir)}
$pay = {Q(payloadDir)}
try {{ Wait-Process -Id {Environment.ProcessId} -Timeout 120 -ErrorAction SilentlyContinue }} catch {{}}
Start-Sleep -Milliseconds 500
# WebView2 자식 프로세스(msedgewebview2)가 잠깐 남아 Runtime\을 잠글 수 있음 → 재시도 루프
$items = @('web', 'Runtime', 'MarkDownEditor.exe')   # exe를 마지막에
$done = @()
$ok = $true
foreach ($n in $items) {{
  $src = Join-Path $pay $n
  if (-not (Test-Path $src)) {{ continue }}
  $dst = Join-Path $app $n
  $bak = ""$dst.old""
  if (Test-Path $bak) {{ Remove-Item $bak -Recurse -Force -ErrorAction SilentlyContinue }}
  $swapped = $false
  for ($i = 0; $i -lt 20 -and -not $swapped; $i++) {{
    try {{
      if (Test-Path $dst) {{ Move-Item $dst $bak -Force }}
      Move-Item $src $dst -Force
      $swapped = $true
    }} catch {{
      if (-not (Test-Path $dst) -and (Test-Path $bak)) {{ try {{ Move-Item $bak $dst -Force }} catch {{}} }}
      Start-Sleep -Milliseconds 500
    }}
  }}
  if ($swapped) {{ $done += $n }} else {{ $ok = $false; break }}
}}
if ($ok) {{
  foreach ($n in $done) {{ Remove-Item (Join-Path $app ""$n.old"") -Recurse -Force -ErrorAction SilentlyContinue }}
  Remove-Item (Join-Path $app '.update') -Recurse -Force -ErrorAction SilentlyContinue
}} else {{
  # 일부만 교체된 상태로 남지 않도록, 교체했던 항목을 모두 원복
  foreach ($n in $done) {{
    $dst = Join-Path $app $n
    if (Test-Path ""$dst.old"") {{
      try {{
        Remove-Item $dst -Recurse -Force -ErrorAction SilentlyContinue
        Move-Item ""$dst.old"" $dst -Force
      }} catch {{}}
    }}
  }}
}}
try {{ Start-Process -FilePath (Join-Path $app 'MarkDownEditor.exe') -WorkingDirectory $app }} catch {{}}
Remove-Item $MyInvocation.MyCommand.Path -Force -ErrorAction SilentlyContinue
";
        var path = Path.Combine(Path.GetTempPath(), "MarkDownEditor-update.ps1");
        File.WriteAllText(path, script, new UTF8Encoding(encoderShouldEmitUTF8Identifier: true));   // BOM — 한글 주석 오독 방지
        return path;
    }

    // 시작 시 1회: 이전 업데이트의 잔재 처리.
    // X.old만 남음(교체 도중 강제 종료) → 원복, X와 X.old가 모두 있음 → 백업만 정리, 스테이징 폴더 → 삭제.
    private static void CleanupUpdateLeftovers()
    {
        var app = AppContext.BaseDirectory;
        foreach (var n in UpdateItems)
        {
            var live = Path.Combine(app, n);
            var bak = live + ".old";
            try
            {
                var bakIsDir = Directory.Exists(bak);
                if (!bakIsDir && !File.Exists(bak)) continue;
                if (Directory.Exists(live) || File.Exists(live))
                {
                    if (bakIsDir) Directory.Delete(bak, recursive: true);
                    else File.Delete(bak);
                }
                else if (bakIsDir) Directory.Move(bak, live);
                else File.Move(bak, live);
            }
            catch { /* 잠금 등 → 다음 실행에서 재시도 */ }
        }
        try
        {
            var staging = Path.Combine(app, ".update");
            if (Directory.Exists(staging)) Directory.Delete(staging, recursive: true);
        }
        catch { }
    }

    private static bool IsDirWritable(string dir)
    {
        try
        {
            var probe = Path.Combine(dir, ".update-probe");
            File.WriteAllText(probe, "");
            File.Delete(probe);
            return true;
        }
        catch { return false; }
    }

    private static long FreeBytes(string path)
    {
        try { return new DriveInfo(Path.GetPathRoot(Path.GetFullPath(path))!).AvailableFreeSpace; }
        catch { return long.MaxValue; }   // 판단 불가 → 진행 (실제 실패는 오류 처리로 흡수)
    }

    // status: checking(웹 자체) | latest | available | error(reason: net/space/apply) | fallback
    private void SendUpdateStatus(string status, string? reason = null)
        => SendToWeb(new
        {
            cmd = "updateStatus",
            status,
            reason,
            current = AppVersion,
            latest = _updateAvail?.Latest.ToString(),
            notes = _updateAvail?.Notes,
        });

    // phase: download(percent 0~100) | extract(-1: 비율 미상) | ready
    private void SendUpdateProgress(string phase, int percent)
        => SendToWeb(new { cmd = "updateProgress", phase, percent });
}
