# MarkDownEditor

**Ein schneller, portabler Markdown-Viewer & -Editor für Windows.**
Doppelklick auf eine `.md`-Datei und sie öffnet sich einfach — keine Installation nötig.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · **Deutsch** · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

![Vorschau — helles Design](docs/images/preview-light.png)

## Highlights

- **Portabel** — entpacken und starten. Die WebView2-Laufzeit ist gebündelt; Einstellungen und Cache bleiben neben der Exe und hinterlassen keine Spuren im System.
- **Automatische Updates** — die App prüft beim Start unauffällig GitHub Releases; gibt es eine neue Version, erscheint ein roter Punkt neben der Versionsanzeige in der Titelleiste. Klicken Sie auf die Version → **Neue Version verfügbar**; das Update läuft direkt in der App mit Fortschrittsbalken — Einstellungen und Sitzung bleiben erhalten. (Das automatische Update — anonyme Versionsprüfung und Download nur bei von Ihnen gestartetem Update — ist der einzige Netzwerkzugriff der App; es werden niemals Dokumente oder persönliche Daten gesendet.)
- **Ein Fenster, viele Tabs** — jede Datei öffnet sich als Tab in einem einzigen Fenster (Einzelinstanz über Mutex + Named Pipe). Tabs lassen sich per Drag & Drop umsortieren und mit `Ctrl+Tab` durchschalten.
- **Alle Links funktionieren** — `.md`-Links öffnen sich in einem neuen Tab, Weblinks im Browser, Ordner im Explorer, andere Dokumente in ihrer Standard-App. Dokumentübergreifende Anker (`doc.md#abschnitt`) werden unterstützt.
- **Zurück / Vorwärts** — Symbolleisten-Buttons, `Alt+←`/`Alt+→` oder Maustasten 4/5.
- **Rendering im GitHub-Stil** — Tabellen, Code-Hervorhebung (offline) und **mermaid-Diagramme** (offline, an das Design angepasst).
- **Inhaltsverzeichnis-Seitenleiste** — mit Scroll-Spy-Hervorhebung des aktuellen Abschnitts.
- **Bearbeiten ↔ Vorschau** — `Ctrl+E`, die Scrollposition wird zwischen beiden Modi synchronisiert.
- **Formatierungsleiste** — erscheint im Bearbeitungsmodus: Fett, Überschriften, Listen, Kontrollkästchen, Zitat, Code, Link, Tabelle, Trennlinie — je ein Klick, **keine Markdown-Kenntnisse nötig** (alles mit `Ctrl+Z` rückgängig zu machen).
- **Kontextmenüs** — Rechtsklick in der Vorschau (Kopieren, Link öffnen, Linkadresse kopieren, Bild anzeigen, Suchen) oder im Editor (Ausschneiden/Kopieren/Einfügen/Alles auswählen).
- **Suchen / Ersetzen** — `Ctrl+F` funktioniert in Vorschau (Hervorhebung aller Treffer) und Bearbeitung; `Ctrl+H` ersetzt im Bearbeitungsmodus.
- **PDF-Export** — der `📄`-Button neben Speichern oder `Ctrl+P`, stets im hellen Design.
- **Bilder aus der Zwischenablage einfügen** — werden in einem `images/`-Ordner neben dem Dokument gespeichert, der Link wird automatisch eingefügt.
- **Automatisches Neuladen bei externen Änderungen** — Änderungen anderer Programme (IDE, Editor) aktualisieren den offenen Tab; Ihre ungespeicherten Änderungen werden nie stillschweigend überschrieben.
- **Automatische Sicherung & Absturzwiederherstellung** — ungespeicherte Änderungen werden alle 30 s gesichert und beim nächsten Start zur Wiederherstellung angeboten.
- **Sitzungswiederherstellung** — beim Start ohne Datei werden die zuletzt geöffneten Tabs wieder geöffnet. Zuletzt verwendete Dateien über den 🕘-Button.
- **Koreanische Kodierungserkennung** — CP949/EUC-KR-Dateien ohne BOM öffnen sich ebenso korrekt wie UTF-8.
- **Dunkles / helles Design** — Umschalten mit dem `🌙`/`☀`-Button in der Titelleiste, wird gemerkt — einschließlich der Windows-Titelleiste.
- **Oberfläche in 10 Sprachen** — 한국어, English, 日本語, 简体中文, 繁體中文, Español, Français, Deutsch, Русский, Português. Folgt standardmäßig der Systemsprache; jederzeit über den `🌐`-Button umschaltbar.
- **Kompakte Oberfläche im Editor-Stil** — Tabs und Werkzeuge sitzen in einer eigenen Titelleiste (freie Fläche ziehen zum Verschieben, Doppelklick zum Maximieren).

![Sprachmenü](docs/images/menu.png)

## Erste Schritte

1. `MarkDownEditor-standalone.zip` aus den Releases herunterladen und **beliebig entpacken**.
2. `MarkDownEditor.exe` starten. Es gibt keinen Installer.
3. (Optional) Als Standard-App für `.md` festlegen: Rechtsklick auf eine `.md`-Datei → *Öffnen mit* → *Andere App auswählen* → `MarkDownEditor.exe` wählen und *Immer* ankreuzen.

> **SmartScreen-Hinweis** — die Binärdatei ist nicht signiert, daher zeigt Windows beim ersten Start ggf. eine Warnung „Unbekannter Herausgeber". Wählen Sie *Weitere Informationen → Trotzdem ausführen* oder bauen Sie selbst aus dem Quellcode (unten).

### Voraussetzungen

- Windows 10 / 11 (64-Bit)
- Keine WebView2-Installation nötig — eine Fixed-Version-Laufzeit ist gebündelt. (Builds ohne Bündel nutzen automatisch die im System installierte Evergreen-Laufzeit.)

## Tastenkürzel

| Taste | Aktion |
|------|------|
| `Ctrl+O` | Öffnen (Mehrfachauswahl möglich) |
| `Ctrl+N` | Neuer Dokument-Tab |
| `Ctrl+S` | Speichern |
| `Ctrl+P` | Als PDF exportieren |
| `Ctrl+E` | Bearbeiten / Vorschau umschalten |
| `Ctrl+F` / `Ctrl+H` | Suchen / Ersetzen |
| `Ctrl+B` / `Ctrl+I` | Fett / Kursiv (Bearbeitungsmodus, umschaltbar) |
| `Ctrl+K` | Link einfügen (Bearbeitungsmodus — die Adresse ist vorausgewählt) |
| `Tab` / `Shift+Tab` | Einrücken / Ausrücken (mehrzeilig) |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Nächster / vorheriger Tab |
| `Ctrl+W` | Tab schließen |
| `Alt+←` / `Alt+→` | Zurück / Vorwärts |

## Aus dem Quellcode bauen

```powershell
cd src
dotnet publish -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

Ausgabe: `src/bin/Release/net9.0-windows/win-x64/publish/MarkDownEditor.exe`.
Legen Sie den Ordner `web/` (und optional eine WebView2 Fixed Version Runtime als `Runtime/`) neben die Exe.

### Architektur in einem Absatz

Die C#-Seite (WPF) übernimmt Datei-E/A, die Einzelinstanz-Pipe und den Fensterrahmen; die Web-Seite (Vanilla JS in einem einzigen WebView2) besitzt alle Dokumentpuffer und den Tab-Zustand. Beide kommunizieren ausschließlich über `postMessage`. Das Rendering nutzt marked + highlight.js + mermaid, alles für den Offline-Betrieb gebündelt. Die vollständige Funktionsübersicht finden Sie in [README.md](README.md) (Koreanisch) oder [README.en.md](README.en.md) (Englisch).

## Feedback

Fehlermeldungen und Funktionswünsche sind auf [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose) willkommen — oder klicken Sie in der App auf die Versionsanzeige neben dem Titel (das Fehlerformular ist mit Ihrer aktuellen Version vorausgefüllt).

## Lizenz

MIT — siehe [LICENSE](LICENSE). Gebündelte Drittanbieter-Komponenten sind in
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) aufgeführt (Hinweis: das mermaid-Bündel enthält einen kleinen dokumentierten lokalen Patch).
