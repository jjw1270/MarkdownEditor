using System.Globalization;
using System.IO;

namespace MarkDownEditor;

// 네이티브 쪽 UI 문자열 (대화상자·파일 필터·창 제목 등) — 웹 쪽은 web/i18n.js가 담당.
// 우선순위: 사용자가 앱에서 고른 언어(lang.txt) > 환경 변수 MDE_LANG > OS 표시 언어.
// 새 언어 추가: Supported + Table + web/i18n.js + README 언어 목록.
internal static class Loc
{
    private static readonly string[] Supported =
        { "ko", "en", "ja", "zh-CN", "zh-TW", "es", "fr", "de", "ru", "pt-BR" };

    public static string Mode { get; private set; } = "auto";   // "auto" 또는 언어 코드
    public static string Lang { get; private set; } = "en";

    private static string LangFile => Path.Combine(MainWindow.DataDir, "lang.txt");

    // 시작 시 1회 (MainWindow 생성 전) — 저장된 설정을 읽어 언어 확정
    public static void Init()
    {
        string? saved = null;
        try { if (File.Exists(LangFile)) saved = File.ReadAllText(LangFile).Trim(); } catch { }
        Mode = IsSupported(saved) ? saved! : "auto";
        var env = Environment.GetEnvironmentVariable("MDE_LANG");
        Lang = Mode != "auto" ? Mode
            : IsSupported(env) ? env!
            : Resolve(CultureInfo.CurrentUICulture);
    }

    // 웹의 언어 메뉴 선택 반영 ("auto"면 저장 삭제 → 다시 OS 언어)
    public static void Set(string? mode)
    {
        Mode = IsSupported(mode) ? mode! : "auto";
        var env = Environment.GetEnvironmentVariable("MDE_LANG");
        Lang = Mode != "auto" ? Mode
            : IsSupported(env) ? env!
            : Resolve(CultureInfo.CurrentUICulture);
        try
        {
            if (Mode == "auto") File.Delete(LangFile);
            else File.WriteAllText(LangFile, Mode);
        }
        catch { }
    }

    private static bool IsSupported(string? c) => c != null && Array.IndexOf(Supported, c) >= 0;

    // OS 문화권 → 지원 언어 (중국어는 번체 지역 구분, 미지원이면 영어)
    private static string Resolve(CultureInfo c)
    {
        var name = c.Name;   // 예: ko-KR, zh-Hant-TW, pt-PT
        if (name.StartsWith("zh", StringComparison.OrdinalIgnoreCase))
            return name.Contains("Hant") || name.Contains("TW") || name.Contains("HK") || name.Contains("MO")
                ? "zh-TW" : "zh-CN";
        if (name.StartsWith("pt", StringComparison.OrdinalIgnoreCase)) return "pt-BR";
        var two = c.TwoLetterISOLanguageName;
        foreach (var s in Supported)
            if (s.StartsWith(two, StringComparison.OrdinalIgnoreCase)) return s;
        return "en";
    }

    private static string T(string key) =>
        Table.TryGetValue(Lang, out var t) && t.TryGetValue(key, out var v) ? v : Table["en"][key];

    public static string NewDoc => T("newDoc");
    public static string DocDefault => T("doc");
    public static string Loading => T("loading");
    public static string FilterOpen => $"Markdown (*.md;*.markdown)|*.md;*.markdown|{T("allFiles")} (*.*)|*.*";
    public static string FilterSave => $"Markdown (*.md)|*.md|{T("allFiles")} (*.*)|*.*";
    public static string CapLink => T("capLink");
    public static string CapError => T("capError");
    public static string CapConfirm => T("capConfirm");
    public static string CapImage => T("capImage");
    public static string LinkNotFound(string p) => T("linkNotFound") + "\n" + p;
    public static string PdfSaved(string n) => T("pdfSaved") + n;
    public static string PdfFailed => T("pdfFailed");
    public static string PdfError(string m) => T("pdfFailed") + "\n" + m;
    public static string ImgSaveError(string m) => T("imgSaveError") + "\n" + m;
    public static string OpenError(string m) => T("openError") + "\n" + m;
    public static string SaveError(string m) => T("saveError") + "\n" + m;
    public static string CloseConfirm => T("closeConfirm");
    public static string WebViewInitError(string m) => T("webviewError") + "\n\n" + m;

    private static readonly Dictionary<string, Dictionary<string, string>> Table = new()
    {
        ["ko"] = new()
        {
            ["newDoc"] = "새 문서", ["doc"] = "문서", ["loading"] = "로딩 중…", ["allFiles"] = "모든 파일",
            ["capLink"] = "링크", ["capError"] = "오류", ["capConfirm"] = "확인", ["capImage"] = "이미지",
            ["linkNotFound"] = "링크된 파일을 찾을 수 없습니다:",
            ["pdfSaved"] = "PDF 저장됨: ", ["pdfFailed"] = "PDF 내보내기에 실패했습니다.",
            ["imgSaveError"] = "이미지를 저장할 수 없습니다:",
            ["openError"] = "파일을 열 수 없습니다:", ["saveError"] = "저장할 수 없습니다:",
            ["closeConfirm"] = "저장하지 않은 변경사항이 있습니다. 닫을까요?",
            ["webviewError"] = "WebView2 런타임을 초기화하지 못했습니다.\n번들된 Runtime 폴더가 없다면 Microsoft Edge WebView2 런타임을 설치해 주세요.",
        },
        ["en"] = new()
        {
            ["newDoc"] = "Untitled", ["doc"] = "Document", ["loading"] = "Loading…", ["allFiles"] = "All files",
            ["capLink"] = "Link", ["capError"] = "Error", ["capConfirm"] = "Confirm", ["capImage"] = "Image",
            ["linkNotFound"] = "Linked file not found:",
            ["pdfSaved"] = "PDF saved: ", ["pdfFailed"] = "PDF export failed.",
            ["imgSaveError"] = "Could not save the image:",
            ["openError"] = "Could not open the file:", ["saveError"] = "Could not save the file:",
            ["closeConfirm"] = "There are unsaved changes. Close anyway?",
            ["webviewError"] = "Failed to initialize the WebView2 runtime.\nIf the bundled Runtime folder is missing, install the Microsoft Edge WebView2 Runtime.",
        },
        ["ja"] = new()
        {
            ["newDoc"] = "無題", ["doc"] = "ドキュメント", ["loading"] = "読み込み中…", ["allFiles"] = "すべてのファイル",
            ["capLink"] = "リンク", ["capError"] = "エラー", ["capConfirm"] = "確認", ["capImage"] = "画像",
            ["linkNotFound"] = "リンク先のファイルが見つかりません:",
            ["pdfSaved"] = "PDFを保存しました: ", ["pdfFailed"] = "PDFのエクスポートに失敗しました。",
            ["imgSaveError"] = "画像を保存できません:",
            ["openError"] = "ファイルを開けません:", ["saveError"] = "保存できません:",
            ["closeConfirm"] = "未保存の変更があります。閉じますか？",
            ["webviewError"] = "WebView2ランタイムを初期化できませんでした。\n同梱のRuntimeフォルダーがない場合は、Microsoft Edge WebView2ランタイムをインストールしてください。",
        },
        ["zh-CN"] = new()
        {
            ["newDoc"] = "无标题", ["doc"] = "文档", ["loading"] = "正在加载…", ["allFiles"] = "所有文件",
            ["capLink"] = "链接", ["capError"] = "错误", ["capConfirm"] = "确认", ["capImage"] = "图片",
            ["linkNotFound"] = "找不到链接的文件:",
            ["pdfSaved"] = "PDF 已保存: ", ["pdfFailed"] = "PDF 导出失败。",
            ["imgSaveError"] = "无法保存图片:",
            ["openError"] = "无法打开文件:", ["saveError"] = "无法保存:",
            ["closeConfirm"] = "有未保存的更改。仍要关闭吗？",
            ["webviewError"] = "无法初始化 WebView2 运行时。\n如果没有捆绑的 Runtime 文件夹，请安装 Microsoft Edge WebView2 运行时。",
        },
        ["zh-TW"] = new()
        {
            ["newDoc"] = "未命名", ["doc"] = "文件", ["loading"] = "載入中…", ["allFiles"] = "所有檔案",
            ["capLink"] = "連結", ["capError"] = "錯誤", ["capConfirm"] = "確認", ["capImage"] = "圖片",
            ["linkNotFound"] = "找不到連結的檔案:",
            ["pdfSaved"] = "PDF 已儲存: ", ["pdfFailed"] = "PDF 匯出失敗。",
            ["imgSaveError"] = "無法儲存圖片:",
            ["openError"] = "無法開啟檔案:", ["saveError"] = "無法儲存:",
            ["closeConfirm"] = "有未儲存的變更。仍要關閉嗎？",
            ["webviewError"] = "無法初始化 WebView2 執行階段。\n如果沒有隨附的 Runtime 資料夾，請安裝 Microsoft Edge WebView2 執行階段。",
        },
        ["es"] = new()
        {
            ["newDoc"] = "Sin título", ["doc"] = "Documento", ["loading"] = "Cargando…", ["allFiles"] = "Todos los archivos",
            ["capLink"] = "Enlace", ["capError"] = "Error", ["capConfirm"] = "Confirmar", ["capImage"] = "Imagen",
            ["linkNotFound"] = "No se encontró el archivo enlazado:",
            ["pdfSaved"] = "PDF guardado: ", ["pdfFailed"] = "Error al exportar el PDF.",
            ["imgSaveError"] = "No se pudo guardar la imagen:",
            ["openError"] = "No se pudo abrir el archivo:", ["saveError"] = "No se pudo guardar:",
            ["closeConfirm"] = "Hay cambios sin guardar. ¿Cerrar de todos modos?",
            ["webviewError"] = "No se pudo inicializar WebView2.\nSi falta la carpeta Runtime incluida, instala Microsoft Edge WebView2 Runtime.",
        },
        ["fr"] = new()
        {
            ["newDoc"] = "Sans titre", ["doc"] = "Document", ["loading"] = "Chargement…", ["allFiles"] = "Tous les fichiers",
            ["capLink"] = "Lien", ["capError"] = "Erreur", ["capConfirm"] = "Confirmer", ["capImage"] = "Image",
            ["linkNotFound"] = "Fichier lié introuvable :",
            ["pdfSaved"] = "PDF enregistré : ", ["pdfFailed"] = "Échec de l'export PDF.",
            ["imgSaveError"] = "Impossible d'enregistrer l'image :",
            ["openError"] = "Impossible d'ouvrir le fichier :", ["saveError"] = "Impossible d'enregistrer :",
            ["closeConfirm"] = "Des modifications ne sont pas enregistrées. Fermer quand même ?",
            ["webviewError"] = "Impossible d'initialiser WebView2.\nSi le dossier Runtime fourni est absent, installez Microsoft Edge WebView2 Runtime.",
        },
        ["de"] = new()
        {
            ["newDoc"] = "Unbenannt", ["doc"] = "Dokument", ["loading"] = "Wird geladen…", ["allFiles"] = "Alle Dateien",
            ["capLink"] = "Link", ["capError"] = "Fehler", ["capConfirm"] = "Bestätigen", ["capImage"] = "Bild",
            ["linkNotFound"] = "Verknüpfte Datei nicht gefunden:",
            ["pdfSaved"] = "PDF gespeichert: ", ["pdfFailed"] = "PDF-Export fehlgeschlagen.",
            ["imgSaveError"] = "Bild konnte nicht gespeichert werden:",
            ["openError"] = "Datei konnte nicht geöffnet werden:", ["saveError"] = "Speichern nicht möglich:",
            ["closeConfirm"] = "Es gibt nicht gespeicherte Änderungen. Trotzdem schließen?",
            ["webviewError"] = "WebView2-Laufzeit konnte nicht initialisiert werden.\nFalls der mitgelieferte Runtime-Ordner fehlt, installieren Sie die Microsoft Edge WebView2 Runtime.",
        },
        ["ru"] = new()
        {
            ["newDoc"] = "Без имени", ["doc"] = "Документ", ["loading"] = "Загрузка…", ["allFiles"] = "Все файлы",
            ["capLink"] = "Ссылка", ["capError"] = "Ошибка", ["capConfirm"] = "Подтверждение", ["capImage"] = "Изображение",
            ["linkNotFound"] = "Файл по ссылке не найден:",
            ["pdfSaved"] = "PDF сохранён: ", ["pdfFailed"] = "Не удалось экспортировать PDF.",
            ["imgSaveError"] = "Не удалось сохранить изображение:",
            ["openError"] = "Не удалось открыть файл:", ["saveError"] = "Не удалось сохранить:",
            ["closeConfirm"] = "Есть несохранённые изменения. Всё равно закрыть?",
            ["webviewError"] = "Не удалось инициализировать среду WebView2.\nЕсли папка Runtime отсутствует, установите Microsoft Edge WebView2 Runtime.",
        },
        ["pt-BR"] = new()
        {
            ["newDoc"] = "Sem título", ["doc"] = "Documento", ["loading"] = "Carregando…", ["allFiles"] = "Todos os arquivos",
            ["capLink"] = "Link", ["capError"] = "Erro", ["capConfirm"] = "Confirmar", ["capImage"] = "Imagem",
            ["linkNotFound"] = "Arquivo vinculado não encontrado:",
            ["pdfSaved"] = "PDF salvo: ", ["pdfFailed"] = "Falha ao exportar o PDF.",
            ["imgSaveError"] = "Não foi possível salvar a imagem:",
            ["openError"] = "Não foi possível abrir o arquivo:", ["saveError"] = "Não foi possível salvar:",
            ["closeConfirm"] = "Há alterações não salvas. Fechar mesmo assim?",
            ["webviewError"] = "Falha ao inicializar o runtime do WebView2.\nSe a pasta Runtime incluída estiver ausente, instale o Microsoft Edge WebView2 Runtime.",
        },
    };
}
