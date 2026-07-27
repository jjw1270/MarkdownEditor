# 검색 노출 · 홍보 체크리스트

돈 안 들이고 검색에서 발견되게 만드는 작업 목록. 위에서부터 **효과 ÷ 소요시간** 순.
`[ ]` 는 아직 안 한 것, `[x]` 는 완료.

---

## 1. GitHub About 채우기 — 5분 · 효과 최대

리포 우측 **About** 옆 톱니바퀴에서 입력. 리포 페이지의 `<title>` 이
`GitHub - jjw1270/MarkdownEditor: {description}` 형태라, **description이 곧 구글 검색 제목**이다.
비워두면 검색 결과에 키워드가 하나도 노출되지 않는다.

- [x] **Description**

  ```
  Lightweight portable Markdown viewer & editor for Windows. Tabs, mermaid diagrams, dark mode, PDF export. No install, no telemetry.
  ```

- [x] **Website**: `https://jjw1270.github.io/MarkdownEditor/`
- [x] **Topics** (최대 20개, 소문자·하이픈만 허용).
      `github.com/topics/markdown-editor` 같은 주제 페이지에 자동 노출된다.

  ```
  markdown markdown-editor markdown-viewer markdown-preview windows wpf dotnet csharp
  webview2 portable portable-app mermaid pdf-export dark-mode text-editor
  notepad-alternative typora-alternative markdown-to-pdf
  ```

- [x] **Releases** 섹션 체크 유지 (사이드바에 다운로드 노출)

---

## 2. GitHub Pages 켜기 — 2분

랜딩 페이지는 `docs/index.html` 에 이미 있다. 설정만 하면 된다.

- [x] **Settings → Pages → Source: Deploy from a branch → `main` / `/docs` → Save**
- [x] 몇 분 뒤 `https://jjw1270.github.io/MarkdownEditor/` 접속 확인
- [x] 위 1번의 Website 필드에 이 주소 입력

리포 페이지와 별개로 **구글이 인덱싱하는 페이지가 하나 더** 생기고,
`docs/index.html` 에는 canonical · Open Graph · JSON-LD(SoftwareApplication) 메타가 들어 있어
검색·SNS 공유 시 카드가 제대로 뜬다. `sitemap.xml` 도 같이 들어 있다.

> GitHub **프로젝트** Pages는 `/MarkdownEditor/` 하위에서 서비스되므로 이 저장소의
> `docs/robots.txt`는 표준 위치인 `https://jjw1270.github.io/robots.txt`가 될 수 없다.
> 그래서 효력이 없는 파일은 두지 않고, 아래처럼 Search Console과 Bing에 sitemap을 직접 제출한다.

- [x] **Google Search Console** (무료)에 `https://jjw1270.github.io/MarkdownEditor/` 등록 →
      sitemap 제출 → URL 색인 등록 상태 확인.
- [ ] **Bing Webmaster Tools** 도 동일하게 (Search Console에서 가져오기 지원)

---

## 3. 백링크 — 각 20~30분 · SEO의 실체

구글 랭킹은 결국 "권위 있는 사이트가 링크해주는가"다. 아래는 전부 무료.

### 3-1. awesome 리스트 PR

- [ ] [0PandaDEV/awesome-windows](https://github.com/0PandaDEV/awesome-windows) — 활발히 관리됨
- [ ] [mundimark/awesome-markdown](https://github.com/mundimark/awesome-markdown)
- [ ] [BubuAnabelas/awesome-markdown](https://github.com/BubuAnabelas/awesome-markdown)

각 리스트의 기여 규칙(CONTRIBUTING)을 먼저 읽고, 형식을 그대로 따를 것.
대개 아래 한 줄을 알파벳 순서에 맞는 위치에 넣는다:

```markdown
- [MarkDownEditor](https://github.com/jjw1270/MarkdownEditor) - Portable Markdown viewer and editor. Opens `.md` files on double-click, tabbed single window, mermaid diagrams, dark mode, PDF export. No installer. ![Open-Source Software][OSS Icon] ![Freeware][Freeware Icon]
```

> 배지 아이콘 표기는 리스트마다 다르니 해당 리포의 기존 항목을 복사해서 맞출 것.

PR 설명 문구:

```
Adds MarkDownEditor, an MIT-licensed portable Markdown viewer/editor for Windows 10/11.

It is a single self-contained folder (no installer, no registry writes) that renders
`.md` files GitHub-style with tabs, offline syntax highlighting, mermaid diagrams,
a TOC sidebar, PDF export, and a 10-language UI.

- Repo: https://github.com/jjw1270/MarkdownEditor
- License: MIT
- Latest release: https://github.com/jjw1270/MarkdownEditor/releases/latest

I have read the contribution guidelines and kept the entry in alphabetical order
and in the existing format.
```

### 3-2. 소프트웨어 디렉터리

- [ ] **[AlternativeTo](https://alternativeto.net/)** — 앱 등록 후 Typora / Mark Text / MarkdownPad
      의 대안으로 연결. "typora alternative" 검색에서 상위에 뜨는 사이트라 유입이 실제로 있다.
- [ ] **[Product Hunt](https://www.producthunt.com/)** — 무료. 화요일~목요일 오전(PST) 등록이 유리.

---

## 4. 초기 star 확보 — GitHub 내부 검색 랭킹에 직접 반영

GitHub 리포 검색은 star 수를 강하게 반영한다. 1 → 50만 되어도 순위가 크게 달라진다.

- [ ] **[GeekNews](https://news.hada.io/)** — 한국 개발자 유입 즉효
- [ ] **Reddit** — [r/Markdown](https://reddit.com/r/Markdown), [r/software](https://reddit.com/r/software),
      [r/windows](https://reddit.com/r/windows), [r/dotnet](https://reddit.com/r/dotnet)
      (서브레딧마다 자기홍보 규칙이 다르니 사이드바를 먼저 확인)
- [ ] **Hacker News — Show HN** — 운 요소가 크지만 터지면 한 방. 평일 오전(PST) 등록.

공용 소개 문구(영어):

```
Show HN: MarkDownEditor – a portable Markdown viewer for Windows that opens on double-click

I wanted to double-click a .md file in Explorer and just see it rendered, without
installing anything or opening VS Code. So I built a single portable folder: unzip,
set it as the default .md handler, done.

Everything opens as tabs in one window. Rendering is GitHub-style with offline
syntax highlighting and mermaid diagrams. It also edits — Ctrl+E toggles a formatting
bar so you don't need to know Markdown syntax — and exports to PDF.

No installer, no registry writes, no telemetry. Network access is limited to anonymous
update checks and release downloads that you explicitly start. MIT licensed, .NET 9 + WebView2.

https://github.com/jjw1270/MarkdownEditor
```

한국어 문구:

```
윈도우에서 .md 파일 더블클릭하면 바로 열리는 마크다운 뷰어를 만들었습니다

탐색기에서 .md 더블클릭 → 렌더링된 문서가 바로 뜨는 걸 원했는데, 그러자고 VS Code를 켜거나
설치형 프로그램을 깔기는 싫어서 직접 만들었습니다. 압축 풀고 .md 기본 프로그램으로 지정하면 끝입니다.

여러 파일을 열어도 창이 하나에 탭으로 모이고, GitHub 스타일 렌더링 + 오프라인 코드
하이라이팅 + mermaid 다이어그램을 지원합니다. Ctrl+E로 편집 모드에 들어가면 서식 바가 떠서
마크다운 문법을 몰라도 쓸 수 있고, PDF로도 내보냅니다.

설치 없음 / 레지스트리 안 건드림 / 텔레메트리 없음. 네트워크는 익명 업데이트 확인과
사용자가 직접 실행한 릴리즈 다운로드에만 사용합니다.
MIT 라이선스, .NET 9 + WebView2로 만들었습니다.

https://github.com/jjw1270/MarkdownEditor
```

---

## 5. 릴리즈마다 반복할 것 — 회당 2분

- [ ] 릴리즈 **제목에 키워드**를 넣는다: `v1.2.3 — Markdown viewer for Windows` 처럼.
      릴리즈 페이지도 개별적으로 색인된다.
- [ ] 릴리즈 노트 첫 문단에 앱이 무엇인지 한 줄 요약을 넣는다 (릴리즈 페이지만 보고 들어온 사람 대상).
---

## 하지 말 것

- star 교환 / 구매, 봇 계정 — GitHub 스팸 필터에 걸리고 계정 제재 위험이 있다.
- description·README 키워드 도배 — 구글이 잡아내고 사람도 떠난다.
- 여러 커뮤니티에 같은 글을 동시에 도배 — 대부분 자기홍보 규칙 위반이다. 하루 이틀 간격을 둘 것.
