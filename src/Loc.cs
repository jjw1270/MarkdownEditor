using System.Globalization;

namespace MarkDownEditor;

// UI 문자열 (ko/en). OS 표시 언어를 따르고, 환경 변수 MDE_LANG=ko|en 으로 강제할 수 있다.
// 웹(JS) 쪽 문자열은 app.js의 L_KO/L_EN이 담당하며, 시작 시 C#이 확정한 언어를 내려보낸다.
internal static class Loc
{
    public static readonly bool Ko = ResolveKo();

    private static bool ResolveKo()
    {
        var env = Environment.GetEnvironmentVariable("MDE_LANG");
        if (env is "ko" or "en") return env == "ko";
        return CultureInfo.CurrentUICulture.TwoLetterISOLanguageName == "ko";
    }

    public static string Lang => Ko ? "ko" : "en";

    public static string NewDoc => Ko ? "새 문서" : "Untitled";
    public static string DocDefault => Ko ? "문서" : "Document";
    public static string Loading => Ko ? "로딩 중…" : "Loading…";

    public static string FilterOpen => Ko
        ? "Markdown (*.md;*.markdown)|*.md;*.markdown|모든 파일 (*.*)|*.*"
        : "Markdown (*.md;*.markdown)|*.md;*.markdown|All files (*.*)|*.*";
    public static string FilterSave => Ko
        ? "Markdown (*.md)|*.md|모든 파일 (*.*)|*.*"
        : "Markdown (*.md)|*.md|All files (*.*)|*.*";

    public static string CapLink => Ko ? "링크" : "Link";
    public static string CapError => Ko ? "오류" : "Error";
    public static string CapConfirm => Ko ? "확인" : "Confirm";
    public static string CapImage => Ko ? "이미지" : "Image";

    public static string LinkNotFound(string path) =>
        (Ko ? "링크된 파일을 찾을 수 없습니다:\n" : "Linked file not found:\n") + path;
    public static string PdfSaved(string name) => (Ko ? "PDF 저장됨: " : "PDF saved: ") + name;
    public static string PdfFailed => Ko ? "PDF 내보내기에 실패했습니다." : "PDF export failed.";
    public static string PdfError(string msg) => (Ko ? "PDF 내보내기 실패:\n" : "PDF export failed:\n") + msg;
    public static string ImgSaveError(string msg) =>
        (Ko ? "이미지를 저장할 수 없습니다:\n" : "Could not save the image:\n") + msg;
    public static string OpenError(string msg) =>
        (Ko ? "파일을 열 수 없습니다:\n" : "Could not open the file:\n") + msg;
    public static string SaveError(string msg) =>
        (Ko ? "저장할 수 없습니다:\n" : "Could not save the file:\n") + msg;
    public static string CloseConfirm =>
        Ko ? "저장하지 않은 변경사항이 있습니다. 닫을까요?" : "There are unsaved changes. Close anyway?";
    public static string WebViewInitError(string msg) => (Ko
        ? "WebView2 런타임을 초기화하지 못했습니다.\n번들된 Runtime 폴더가 없다면 Microsoft Edge WebView2 런타임을 설치해 주세요.\n\n"
        : "Failed to initialize the WebView2 runtime.\nIf the bundled Runtime folder is missing, install the Microsoft Edge WebView2 Runtime.\n\n") + msg;
}
