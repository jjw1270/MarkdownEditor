# MarkDownEditor

**가볍고 빠른 Windows용 마크다운 뷰어 & 에디터.**
`.md` 파일을 더블클릭하면 바로 열리는 앱입니다. 가벼운 일반 설치판과 완전 포터블판을 모두 제공합니다.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-10.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

**한국어** · [English](README.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

### ⬇️ [Windows 설치판](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-Setup-x64.exe) &nbsp;·&nbsp; [포터블 ZIP](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip) &nbsp;·&nbsp; <sub>[바뀐 점 보기](https://github.com/jjw1270/MarkdownEditor/releases/latest)</sub>

![미리보기 — 한국어 UI](docs/images/ko/preview.png)

---

## 왜 만들었나

윈도우에서 `.md` 파일을 열려면 대개 설치형 프로그램을 깔거나, 브라우저 확장을 붙이거나, VS Code 같은 코드 에디터를 띄워야 합니다. 이 앱은 그 셋 다 필요 없습니다. **마크다운 뷰어가 먼저**이고, `.md` 기본 프로그램으로 지정해두면 README·명세서·메모 폴더를 탐색기에서 더블클릭하는 것만으로 렌더링된 문서를 볼 수 있습니다. 편집은 `Ctrl+E` 한 번 거리에 있습니다.

- **두 가지 배포 방식** — 일상 사용에는 가벼운 사용자별 설치판을, USB·완전 오프라인 사용에는 Runtime까지 포함한 포터블판을 선택할 수 있습니다.
- **포터블 우선 저장** — 설정·캐시는 실행 파일 옆에 저장합니다. 해당 폴더가 읽기 전용이면 레지스트리나 `%AppData%` 대신 `%TEMP%\MarkDownEditor`를 사용합니다.
- **오프라인 문서 처리** — 렌더링·하이라이팅·다이어그램은 전부 로컬입니다. 새 버전 확인을 위해 GitHub Releases를 익명으로 조회하고, 사용자가 업데이트를 실행한 경우에만 릴리즈 파일을 내려받습니다.
- **무료 · 오픈소스** — MIT 라이선스.

**무료 마크다운 뷰어**, **가벼운 Typora 대안**, **md 파일 여는 프로그램**을 찾고 있었다면 바로 그 용도로 만든 앱입니다.

---

## ✨ 이런 앱입니다

- **더블클릭 = 바로 열림** — Windows 기본 `.md` 연결 프로그램으로 지정해두면 탐색기에서 파일을 더블클릭하는 순간 열립니다.
- **창은 언제나 하나, 문서는 탭으로** — 여러 파일을 한꺼번에 열어도 프로그램이 우수수 뜨지 않습니다. 모두 한 창의 **탭**으로 모입니다. 탭은 **드래그로 순서 변경**이 됩니다.
- **드래그&드롭으로 열기** — 탐색기에서 `.md`/`.txt` 파일을 창에 끌어다 놓으면 바로 탭으로 열립니다.
- **모든 링크가 동작** — `.md`는 새 탭, 웹 링크는 기본 브라우저, `.html`은 브라우저, 폴더는 탐색기, `pdf/docx/xlsx/hwp` 등 문서는 연결 프로그램으로 열립니다. `문서.md#섹션` 형태의 **문서 간 앵커 이동**도 지원합니다.
- **뒤로 / 앞으로** — 방문한 문서 사이를 툴바 `←` `→` 버튼, `Alt+←` / `Alt+→`, 또는 **마우스 4·5번 버튼**으로 오갑니다.
- **목차 사이드바** — 탭 바로 아래 왼쪽의 `☰` 버튼으로 헤딩 목록을 켜고 끕니다(상태 기억). 목차가 열리면 버튼이 **패널 상단으로 들어가** 그 자리에서 닫을 수 있습니다. 항목을 누르면 해당 위치로 스크롤되고, **읽는 위치를 따라 현재 섹션이 강조**됩니다.
- **외부 변경 자동 반영** — 열린 문서를 다른 프로그램(IDE·메모장 등)이 저장하면 **자동으로 새로고침**됩니다. 저장 안 한 내 편집이 있으면 덮어쓸지 물어봅니다.
- **편집 ↔ 미리보기 스크롤 동기화** — 모드를 전환하면 보던 위치에 해당하는 지점으로 자동 이동합니다.
- **키보드로 바로 읽기** — 실행 직후 클릭 없이 `PageUp/Down` · 방향키 · `Home/End`로 미리보기를 스크롤할 수 있습니다.
- **탭 우클릭 메뉴** — 닫기 · 다른 탭 모두 닫기 · 탐색기에서 보기 · 경로 복사.
- **코드 하이라이팅** — ` ```cs `, ` ```bash ` 처럼 언어를 지정한 코드 블록에 문법 색상이 입혀집니다(오프라인 동작, 테마 연동).
- **mermaid 다이어그램** — GitHub/GitLab과 동일한 ` ```mermaid ` 문법으로 플로차트·시퀀스 등 렌더링(오프라인 동작, 테마 연동).
- **PDF 내보내기** — 저장 옆 `📄` 버튼 한 번으로 미리보기를 그대로 PDF 파일로 저장합니다.
- **로컬 이미지 표시** — 문서가 상대·절대 경로로 참조한 이미지(`![](그림.png)`)를 자동으로 찾아 보여줍니다.
- **클립보드 이미지 붙여넣기** — 편집 중 `Ctrl+V`로 스크린샷을 붙여넣으면 문서 옆 `images/` 폴더에 저장되고 링크가 자동 삽입됩니다.
- **자동 백업 & 복구** — 저장 안 된 변경사항을 30초마다 스냅샷해 두었다가, 비정상 종료 후 재실행하면 복구를 제안합니다.
- **세션 복원 & 최근 문서** — 파일 없이 실행하면 마지막에 열려 있던 탭들을 다시 열고, `🕘` 버튼으로 최근 문서를 바로 열 수 있습니다.
- **UI 언어 10종** — 한국어·English·日本語·简体中文·繁體中文·Español·Français·Deutsch·Русский·Português. 기본은 OS 언어를 따르고, 타이틀바 `🌐` 버튼에서 바로 바꿀 수 있습니다.
- **줌 기억** — `Ctrl+휠`로 조절한 배율을 다음 실행에도 유지합니다.
- **위치 기억** — 탭을 전환해도 미리보기 스크롤과 **편집 커서 위치까지** 그대로 유지됩니다.
- **한글 인코딩 자동 감지** — UTF-8은 물론 BOM 없는 CP949(EUC-KR) 문서도 깨짐 없이 열립니다.
- **다크 / 라이트 테마** — 타이틀바 `🌙`/`☀` 버튼으로 전환, 한 번 고르면 다음 실행에도 기억합니다. Windows **제목표시줄도 함께** 전환됩니다.
- **편집 ↔ 미리보기 즉시 전환** — `Ctrl+E` 한 번.
- **서식 바** — 편집 모드에 나타나는 버튼 줄로 굵게·제목·목록·체크박스·인용·코드·링크·표·구분선을 클릭 한 번에. **마크다운 문법을 몰라도 됩니다** (모두 `Ctrl+Z`로 되돌리기 가능).
- **우클릭 메뉴** — 미리보기(복사·링크 열기·주소 복사·이미지 확대·찾기), 편집기(잘라내기·복사·붙여넣기·모두 선택)를 우클릭으로.
- **찾기 / 바꾸기** — `Ctrl+F` 찾기는 **미리보기·편집 모두** 지원(미리보기는 전체 매치 하이라이트), `Ctrl+H` 바꾸기는 편집 모드에서. 대소문자 구분과 **모두 바꾸기**를 지원합니다.
- **이미지 클릭 확대** — 미리보기의 이미지를 클릭하면 화면 가득 크게 보여줍니다(클릭·`Esc`로 닫기).
- **자동 업데이트** — 새 버전이 나오면 타이틀 옆에 **빨간 점**이 표시됩니다. 포터블판은 검증한 ZIP을 원자적으로 교체하고, 설치판은 검증한 다음 설치 프로그램을 실행해 Windows 제거 정보까지 올바르게 갱신합니다.
- **설치판 또는 포터블판** — 설치판은 자동 보안 업데이트되는 시스템 WebView2와 `%LOCALAPPDATA%\MarkDownEditor` 데이터 폴더를 사용합니다. 포터블판은 Fixed Runtime을 포함하고 설정·캐시를 실행 파일 옆에 둡니다.

---

## 📸 화면

| 문서 미리보기 | 언어·버전 메뉴 |
|:---:|:---:|
| ![한국어 문서 미리보기](docs/images/ko/preview.png) | ![한국어 언어 메뉴](docs/images/ko/menu.png) |

---

## 🚀 설치하기

두 패키지 모두 Windows 10 1809 이상 / Windows 11 x64용이며 관리자 권한이 필요 없습니다.

| 패키지 | 권장 용도 | 대략적인 용량 | Runtime·데이터 |
|---|---|---:|---|
| **[Windows 설치판](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-Setup-x64.exe)** | 일반적인 일상 사용 | 45 MB | 현재 사용자용으로 설치하고 자동 보안 업데이트되는 Evergreen WebView2를 사용합니다. 시작 메뉴와 연결 프로그램 후보를 등록하며 데이터는 `%LOCALAPPDATA%\MarkDownEditor`에 보관합니다. WebView2가 없을 때만 인터넷이 필요하며 필수 Runtime 설치에 실패하면 설치 오류를 표시합니다. |
| **[포터블 ZIP](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip)** | USB·오프라인·무설치 사용 | 325 MB | Fixed WebView2 Runtime을 포함하며, 쓸 수 있는 위치에서는 데이터가 실행 파일 옆 `WebView2Data/`에 남습니다. |

[전체 릴리즈](https://github.com/jjw1270/MarkdownEditor/releases) · [최신 릴리즈 노트](https://github.com/jjw1270/MarkdownEditor/releases/latest) · [전체 변경 이력](CHANGELOG.md)

<details>
<summary><b>터미널이 편하다면</b> — PowerShell 한 블록으로 내려받기 · 압축 해제 · 실행</summary>

```powershell
$dest = "$env:LOCALAPPDATA\Programs\MarkDownEditor-Portable"
$zip  = "$env:TEMP\MarkDownEditor-standalone.zip"

Invoke-WebRequest "https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip" -OutFile $zip
Expand-Archive $zip -DestinationPath $dest -Force
Remove-Item $zip

Start-Process "$dest\MarkDownEditor.exe"
```

나중에 업데이트할 때 같은 블록을 다시 실행해도 되고, 아래의 **앱 내 자동 업데이트**를 써도 됩니다.

</details>

### 포터블판 실행

쓰기 가능한 곳이면 어디든 좋습니다. `C:\Tools\MarkDownEditor`, 바탕화면, USB 메모리 — 상관없습니다. 압축을 푼 뒤 **`MarkDownEditor.exe`** 를 실행하세요.

폴더 안에는 `MarkDownEditor.exe` 와 함께 `web/`(UI), `Runtime/`(번들 WebView2), `WebView2Data/`(캐시)가 들어 있습니다. 이 폴더를 통째로 옮기거나 복사하거나 USB에 담아 다른 PC에서 그대로 써도 됩니다.

> **처음 실행할 때 뜨는 파란 SmartScreen 창은 정상입니다.** 코드 서명이 없는 실행 파일이라 Windows가 *"Windows의 PC 보호"* 경고를 띄웁니다. **추가 정보 → 실행**을 누르세요. 한 번만 뜹니다.
> 서명 없는 파일을 실행하기 꺼려진다면 직접 빌드해도 됩니다 — 아래 *개발자용* 절차로 명령 두 줄이면 됩니다.

### `.md` 기본 프로그램으로 지정 *(사실상 이게 핵심)*

한 번만 지정해두면, 탐색기에서 마크다운 파일을 더블클릭하는 순간 렌더링된 문서가 바로 뜹니다.

1. 탐색기에서 아무 `.md` 파일을 **우클릭**
2. **연결 프로그램 → 다른 앱 선택**
3. 목록에서 **MarkDownEditor** 선택 — 설치판은 자동으로 후보에 등록되며, 포터블판은 **내 PC에서 앱 선택**으로 `MarkDownEditor.exe` 지정
4. **항상 이 앱을 사용하여 .md 파일 열기** 체크 → **확인**

`.markdown`, `.txt` 도 같은 방법으로 연결할 수 있습니다.

### 업데이트

앱은 시작할 때 GitHub 릴리즈를 익명으로 확인하고 새 버전이 있으면 타이틀 옆에 **빨간 점**을 표시합니다. 버전 → **업데이트하기**를 누르면 URL·크기·SHA-256·패키지 구조·버전을 확인한 뒤 적용합니다. 포터블판은 ZIP 페이로드를 원자적으로 교체하고, 설치판은 다음 사용자별 설치 프로그램을 실행합니다. 설정·열린 탭·세션은 보존됩니다.

### 삭제

- **설치판:** **설정 → 앱 → 설치된 앱 → MarkDownEditor → 제거**를 사용합니다. 프로그램·바로가기·앱이 등록한 연결 프로그램 항목은 제거되고, 안전한 재설치를 위해 `%LOCALAPPDATA%\MarkDownEditor` 사용자 데이터는 보존됩니다. 원하지 않으면 이 폴더도 직접 삭제하세요.
- **포터블판:** 앱 폴더를 삭제합니다. 읽기 전용 위치에서 실행한 적이 있다면 폴백 데이터가 있는 `%TEMP%\MarkDownEditor`도 삭제하세요.

---

## 📖 기본 사용법

| 하고 싶은 것 | 방법 |
|---|---|
| 파일 열기 | 탐색기에서 더블클릭 · 창으로 드래그&드롭 · 타이틀바 왼쪽 `📂 열기` 버튼 · `Ctrl+O` (**여러 개 동시 선택 가능**) |
| 최근 문서 | 열기 옆 `🕘` 버튼 |
| 새 문서 | 탭 줄 끝의 `+` 버튼 · `Ctrl+N` |
| 여러 파일을 한 창에 | 그냥 여러 개를 열면 자동으로 탭이 됩니다 |
| 탭 전환 / 순서 변경 | 탭 클릭 / 탭을 드래그해 원하는 위치로 |
| 방문한 문서로 뒤로 / 앞으로 | 툴바 `←` `→` · `Alt+←` / `Alt+→` · 마우스 4·5번 버튼 |
| 목차 사이드바 | 탭 아래 왼쪽 `☰` 버튼 (미리보기 전용, 상태 기억) |
| 문서 내 목차(섹션)로 이동 | 미리보기의 `#섹션` 링크 클릭 · 목차 항목 클릭 |
| 탭 닫기 | 탭의 `×` · `Ctrl+W` |
| 편집 / 미리보기 전환 | `✏️` 버튼 · `Ctrl+E` |
| 찾기 / 바꾸기 (편집 모드) | `Ctrl+F` 찾기 · `Ctrl+H` 바꾸기 |
| 저장 | `💾 저장` · `Ctrl+S` (새 문서는 저장 위치를 묻습니다) |
| PDF로 내보내기 | 저장 옆 `📄` 버튼 · `Ctrl+P` (미리보기 내용 그대로, 라이트 테마로 출력) |
| 이미지 붙여넣기 | 편집 중 `Ctrl+V` — 문서 옆 `images/` 폴더에 저장 + 링크 삽입 (저장된 문서에서만) |
| 다크/라이트 전환 | 타이틀바 `🌙`/`☀` 버튼 |
| UI 언어 변경 | 타이틀바 `🌐` 버튼 (기본: 시스템 언어 자동, 현재 언어가 툴팁·메뉴에 표시) |
| 업데이트 확인 / 적용 | 타이틀 옆 버전 클릭 → 메뉴 첫 항목 — 새 버전이 있으면 버전 오른쪽에 빨간 점이 뜨고, 팝업의 **업데이트하기**로 바로 적용 |
| 창 이동 / 최대화 | 타이틀바 빈 공간 드래그 / 더블클릭 |
| 연결된 문서 열기 | 미리보기에서 링크 클릭 (`.md`는 탭 · 웹/HTML은 브라우저 · 폴더는 탐색기 · 문서 파일은 연결 프로그램) |

- 저장하지 않은 변경이 있는 탭은 제목 앞에 **●** 표시가 붙고, 닫을 때 확인을 묻습니다.
- 이미 열려 있는 파일을 다시 열면 새 탭을 만들지 않고 **기존 탭으로 이동**합니다.

### 키보드 단축키

| 키 | 동작 |
|------|------|
| `Ctrl+O` | 열기 |
| `Ctrl+N` | 새 문서 탭 |
| `Ctrl+S` | 저장 |
| `Ctrl+P` | PDF로 내보내기 |
| `Ctrl+E` | 편집 / 미리보기 전환 |
| `Ctrl+F` | 찾기 (미리보기·편집 모두) |
| `Ctrl+H` | 찾기 / 바꾸기 |
| `Enter` / `Shift+Enter` | 다음 / 이전 결과 (찾기 입력창에서) |
| `Esc` | 찾기 바 닫기 |
| `Ctrl+B` / `Ctrl+I` | 선택 영역 굵게 / 기울임 (편집 모드, 다시 누르면 해제) |
| `Ctrl+K` | 링크 삽입 (편집 모드 — 주소 자리가 선택된 채 삽입됨) |
| `Tab` / `Shift+Tab` | 들여쓰기 / 내어쓰기 (편집 모드, 여러 줄 선택 지원) |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | 다음 / 이전 탭 |
| `Ctrl+W` | 현재 탭 닫기 |
| `Alt+←` / `Alt+→` | 문서 뒤로 / 앞으로 이동 |

---

## 🧜 mermaid 다이어그램

코드 펜스 언어를 `mermaid` 로 지정하면 GitHub/GitLab과 **동일한 문법**의 다이어그램이 렌더링됩니다. 플로차트·시퀀스·간트·상태도 등 [mermaid 문법](https://mermaid.js.org/) 전체를 지원하며, **오프라인으로 동작**하고 다크/라이트 테마에 자동으로 맞춰집니다.

````markdown
```mermaid
flowchart TD
    A["파일 더블클릭"] --> B{"이미 실행 중?"}
    B -->|예| C["기존 창으로 경로 전달"]
    B -->|아니오| D["새 창 실행"]
    C --> E["새 탭으로 문서 열기"]
    D --> E
```
````

- 이 에디터로 작성한 다이어그램은 GitLab/GitHub 웹에서도 그대로 렌더링됩니다(반대도 마찬가지).
- 문법 오류가 있는 블록은 해당 블록 자리에만 오류가 표시되고 나머지 문서는 정상 렌더링됩니다.

---

## 🔒 데이터 & 프라이버시

- 문서·설정을 클라우드로 보내지 않습니다. 모든 동작은 로컬에서만 이뤄집니다.
- 앱 사용 중 네트워크 접근은 **자동 업데이트**로 제한됩니다. GitHub API에서 최신 버전을 익명으로 확인하고 사용자가 업데이트를 실행한 경우에만 릴리즈 파일을 내려받습니다. 최초 설치 때 Windows에 WebView2가 없으면 설치 프로그램이 Microsoft에서 Runtime을 받을 수 있습니다. 문서·개인 정보는 아무것도 전송하지 않습니다.
- 설치판의 WebView2 캐시, 테마·언어 설정, 세션 복구 내용과 최근 문서 경로는 `%LOCALAPPDATA%\MarkDownEditor`에 저장됩니다. 포터블판은 실행 파일 옆 **`WebView2Data/`** 를 사용하며, 해당 위치가 읽기 전용이면 `%TEMP%\MarkDownEditor`로 폴백합니다.
- 엄격한 **콘텐츠 보안 정책(CSP)** 이 인라인 스크립트·플러그인·기준 URL 변경과 원격 이미지 자동 요청을 차단합니다. 로컬 이미지는 네이티브 호스트가 찾아 로컬 데이터로 렌더링합니다.
- 배포 빌드에서는 브라우저 기본 우클릭 메뉴·개발자 도구가 비활성화되어 있습니다. (앱 자체 우클릭 메뉴는 정상 동작)

---

## 🛠️ 개발자용

### 프로젝트 구조

```
src/
├─ App.xaml(.cs)          # 앱 진입점 + 단일 인스턴스(뮤텍스) + 파일 경로 파이프 라우팅
├─ MainWindow.xaml(.cs)   # WebView2 호스트 + 파일 입출력 + 로딩 스플래시/테마
├─ MainWindow.Update.cs   # 자동 업데이트 (GitHub 릴리즈 확인 · 다운로드 · 재시작 교체)
├─ Loc.cs                 # 네이티브 쪽 UI 문자열 (10개 언어, lang.txt 설정)
├─ app.manifest           # DPI 인식(per-monitor v2), 긴 경로 지원
├─ MarkDownEditor.csproj  # net10.0-windows, WebView2 패키지, web/ 복사 규칙
└─ web/                   # UI (WebView2가 로컬 가상 호스트로 로드)
   ├─ index.html          # 레이아웃(툴바 · 탭 · 목차 · 미리보기/편집기)
   ├─ style.css           # 테마 변수 · GitHub 풍 스타일 · 목차/인쇄(PDF) CSS
   ├─ app.js              # 탭 상태 관리 · 렌더링 · 백업/복구 · C# 브리지
   ├─ i18n.js             # 웹 쪽 UI 문자열 (10개 언어)
   ├─ marked.min.js       # 마크다운 파서
   ├─ highlight.min.js    # 코드 하이라이팅 (오프라인 번들)
   └─ mermaid.min.js      # mermaid 다이어그램 (오프라인 번들)
```

```powershell
.\tests\RepositoryContracts.ps1
.\scripts\build-release.ps1 -RuntimeSource C:\path\to\WebView2FixedRuntime
```

저장소는 .NET SDK 10.0.302와 Inno Setup 7.0.2를 고정합니다. 릴리즈 스크립트가 동일한 게시물에서 설치판·포터블판을 만들고, WebView2 bootstrapper 해시를 검증한 뒤 `SHA256SUMS.txt`와 기계 판독 가능한 manifest를 생성합니다. 배포·데이터·신뢰 경계는 [DESIGN.md](DESIGN.md)를 참고하세요.

현재 버전의 전체 E2E 릴리즈 근거는 [QA_REPORT_2026-07-28.md](QA_REPORT_2026-07-28.md)에 기록했습니다.

### 아키텍처 한눈에

```mermaid
flowchart TD
    A["탐색기에서 .md 더블클릭"] --> B["App: 뮤텍스로 단일 인스턴스 판별"]
    B -->|"실행 중"| C["Named Pipe로 경로 전달 후 종료"]
    B -->|"최초"| D["창 생성 + 파이프 서버 가동"]
    D --> E["C# ↔ 웹(JS) 메시지 통신<br/>C#: 파일 입출력·창 라우팅 / 웹: 문서 버퍼·탭 상태 소유"]
    C -.-> E
    E --> F["새 탭으로 렌더링"]
```

- **C# 쪽**은 파일 읽기/쓰기와 "어느 인스턴스가 파일을 받을지"만 담당합니다.
- **웹 쪽**이 열린 문서 버퍼와 탭 상태를 모두 소유합니다. 덕분에 탭이 몇 개든 **WebView2 인스턴스는 항상 1개**라 가볍습니다.
- 둘은 `postMessage` 기반 메시지로만 통신합니다.

---

## 💬 피드백

버그 신고와 기능 제안은 [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose)로 받습니다. 앱 안에서 타이틀 옆 버전 표시를 클릭해도 바로 이동할 수 있습니다(버그 신고 폼에는 현재 버전이 자동으로 채워집니다).

## 📄 라이선스

MIT — [LICENSE](LICENSE) 참고. 번들된 서드파티 구성요소는 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)에 정리되어 있습니다 (mermaid 번들에는 문서화된 로컬 패치가 하나 포함되어 있습니다).

---

<sub>Made with .NET 10 (WPF) · WebView2 · marked.js</sub>
