using System.IO;
using System.IO.Pipes;
using System.Text;
using System.Threading;
using System.Windows;

namespace MarkDownEditor;

public partial class App : Application
{
    // 단일 인스턴스 판별용(세션 로컬) 뮤텍스 + 파일 경로 전달용 파이프
    private const string MutexName = "MarkDownEditor.SingleInstance.v1";
    private const string PipeName = "MarkDownEditor.Pipe.v1";

    private Mutex? _mutex;
    private MainWindow? _window;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // BOM 없는 한글(CP949/EUC-KR) 문서 폴백 디코딩용 레거시 코드페이지 등록
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

        // UI 언어 확정 (저장된 설정 > MDE_LANG > OS 언어) — 창 생성 전에
        Loc.Init();

        // 더블클릭/연결 프로그램 실행 시 인자로 파일 경로가 넘어옴
        // (여러 파일을 한 번에 넘기는 실행 형태도 지원 → 모두 탭으로)
        var files = ResolveFileArgs(e.Args);

        // 이미 실행 중이면 새 창을 띄우지 않고 파일 경로만 기존 인스턴스에 넘긴 뒤 종료
        _mutex = new Mutex(true, MutexName, out var createdNew);
        if (!createdNew)
        {
            ForwardToRunningInstance(files);
            Shutdown();
            return;
        }

        // 첫 인스턴스: 창을 만들고, 후속 실행이 보낼 파일 경로를 수신할 파이프 서버 가동
        _window = new MainWindow();
        _window.SetStartupFiles(files);
        _window.Show();
        StartPipeServer();
    }

    // 존재하는 파일만 절대경로로 정규화 (옵션성 인자·잘못된 경로 걸러냄)
    private static List<string> ResolveFileArgs(string[] args)
    {
        var list = new List<string>();
        foreach (var a in args)
        {
            if (string.IsNullOrWhiteSpace(a)) continue;
            try
            {
                var full = Path.GetFullPath(a);
                if (File.Exists(full)) list.Add(full);
            }
            catch { /* 경로 형식 오류 무시 */ }
        }
        return list;
    }

    // 후속 인스턴스 → 실행 중인 인스턴스로 파일 경로 전달 (여러 건은 줄바꿈으로 구분)
    private static void ForwardToRunningInstance(List<string> files)
    {
        try
        {
            using var client = new NamedPipeClientStream(".", PipeName, PipeDirection.Out);
            client.Connect(3000);
            using var writer = new StreamWriter(client, new UTF8Encoding(false)) { AutoFlush = true };
            writer.Write(string.Join('\n', files));
        }
        catch { /* 전달 실패해도 조용히 종료 */ }
    }

    // 실행 중 인스턴스: 후속 실행이 보내는 파일 경로를 계속 수신해 창에 전달
    private void StartPipeServer()
    {
        var thread = new Thread(() =>
        {
            while (true)
            {
                try
                {
                    using var server = new NamedPipeServerStream(
                        PipeName, PipeDirection.In, 1, PipeTransmissionMode.Byte, PipeOptions.None);
                    server.WaitForConnection();
                    using var reader = new StreamReader(server, new UTF8Encoding(false));
                    var payload = reader.ReadToEnd();
                    var paths = payload.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                    // 파일이 없어도(빈 실행) 기존 창을 앞으로 가져와 "실행했는데 반응 없음"을 방지
                    _window?.Dispatcher.BeginInvoke(() => _window!.OpenExternalFiles(paths));
                }
                catch { /* 파이프 오류 → 다시 수신 대기 */ }
            }
        })
        { IsBackground = true, Name = "MDE-PipeServer" };
        thread.Start();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _mutex?.Dispose();
        base.OnExit(e);
    }
}
