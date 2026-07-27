// C# 호스트와 통신하는 브리지
const host = window.chrome && window.chrome.webview;

const els = {
  tabs: document.getElementById('tabs'),
  preview: document.getElementById('preview'),
  editor: document.getElementById('editor'),
  bar: document.getElementById('bar'),
  appTitle: document.getElementById('appTitle'),
  appVer: document.getElementById('appVer'),
  minBtn: document.getElementById('minBtn'),
  maxBtn: document.getElementById('maxBtn'),
  closeBtn: document.getElementById('closeBtn'),
  toc: document.getElementById('toc'),
  tocHead: document.getElementById('tocHead'),
  tocList: document.getElementById('tocList'),
  tocBtn: document.getElementById('tocBtn'),
  tocRail: document.getElementById('tocRail'),
  lightbox: document.getElementById('lightbox'),
  lightboxImg: document.getElementById('lightboxImg'),
  pdfBtn: document.getElementById('pdfBtn'),
  themeBtn: document.getElementById('themeBtn'),
  langBtn: document.getElementById('langBtn'),
  toast: document.getElementById('toast'),
  ctxmenu: document.getElementById('ctxmenu'),
  toggleBtn: document.getElementById('toggleBtn'),
  saveBtn: document.getElementById('saveBtn'),
  openBtn: document.getElementById('openBtn'),
  recentBtn: document.getElementById('recentBtn'),
  tocTitleEl: document.getElementById('tocTitle'),
  backBtn: document.getElementById('backBtn'),
  fwdBtn: document.getElementById('fwdBtn'),
  fmtbar: document.getElementById('fmtbar'),
  findbar: document.getElementById('findbar'),
  findToggle: document.getElementById('findToggle'),
  findInput: document.getElementById('findInput'),
  replaceInput: document.getElementById('replaceInput'),
  findCount: document.getElementById('findCount'),
  findPrev: document.getElementById('findPrev'),
  findNext: document.getElementById('findNext'),
  findCase: document.getElementById('findCase'),
  findClose: document.getElementById('findClose'),
  replaceOne: document.getElementById('replaceOne'),
  replaceAll: document.getElementById('replaceAll'),
  updBtn: document.getElementById('updBtn'),
  updOverlay: document.getElementById('updOverlay'),
  updClose: document.getElementById('updClose'),
  updTitle: document.getElementById('updTitle'),
  updCurLabel: document.getElementById('updCurLabel'),
  updCur: document.getElementById('updCur'),
  updLatestLabel: document.getElementById('updLatestLabel'),
  updLatest: document.getElementById('updLatest'),
  updMsg: document.getElementById('updMsg'),
  updBarWrap: document.getElementById('updBarWrap'),
  updBarFill: document.getElementById('updBarFill'),
  updPct: document.getElementById('updPct'),
  updNotesWrap: document.getElementById('updNotesWrap'),
  updNotesLabel: document.getElementById('updNotesLabel'),
  updNotes: document.getElementById('updNotes'),
  updCheckBtn: document.getElementById('updCheckBtn'),
  updApplyBtn: document.getElementById('updApplyBtn'),
};

// ---- 로케일 ----
// 문자열 테이블·언어 목록·태그 매칭은 i18n.js(I18N/LANG_NAMES/resolveLang)에 있다.
// 시작은 브라우저 언어로 추정하고, C#이 ready 후 확정값(언어 설정 > MDE_LANG > OS 언어)을 보내면 재적용.
let langCurrent = resolveLang(navigator.language);   // 현재 적용된 언어 코드
let L = I18N[langCurrent] || I18N.en;
let langMode = 'auto';     // 'auto' 또는 언어 코드 — 🌐 언어 메뉴의 체크 표시용
let winMaximized = false;  // 창 최대화 상태 (커스텀 타이틀바 — applyLocale의 복원/최대화 툴팁에도 사용)

// 접근성: 시스템의 "동작 줄이기" 설정 시 부드러운 스크롤 대신 즉시 이동
const SMOOTH = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ? 'auto' : 'smooth';

// 아이콘 버튼은 title이 곧 접근성 이름 — 함께 갱신
function setTitle(el, text) { el.title = text; el.setAttribute('aria-label', text); }

// 정적 UI 텍스트를 현재 로케일로 적용 (부팅 시 1회 + C#이 언어 확정값을 보내면 재적용)
function applyLocale(lang) {
  if (lang) {
    langCurrent = I18N[lang] ? lang : 'en';
    L = I18N[langCurrent];
  }
  // 툴바는 아이콘 전용 — 라벨은 툴팁(title)으로만
  setTitle(els.openBtn, L.openTitle);
  setTitle(els.recentBtn, L.recentTitle);
  setTitle(els.saveBtn, L.saveTitle);
  setTitle(els.pdfBtn, L.menuPdf);
  setTitle(els.langBtn, `${L.menuLang} — ${langCurrent.toUpperCase()}`);
  updateThemeTitle();
  setTitle(els.backBtn, L.backTitle);
  setTitle(els.fwdBtn, L.fwdTitle);
  setTitle(els.tocBtn, L.tocBtnTitle);
  // 서식 바 (아이콘/약자 버튼 — 라벨은 툴팁으로만)
  const fmtTips = {
    fmtBold: `${L.fmtBold} (Ctrl+B)`, fmtItalic: `${L.fmtItalic} (Ctrl+I)`, fmtStrike: L.fmtStrike,
    fmtH1: L.fmtH1, fmtH2: L.fmtH2, fmtH3: L.fmtH3,
    fmtBullet: L.fmtBullet, fmtNumber: L.fmtNumber, fmtTask: L.fmtTask,
    fmtQuote: L.fmtQuote, fmtCode: L.fmtCode,
    fmtLink: `${L.fmtLink} (Ctrl+K)`, fmtTable: L.fmtTable, fmtHr: L.fmtHr,
  };
  for (const id in fmtTips) setTitle(document.getElementById(id), fmtTips[id]);
  els.tocTitleEl.textContent = L.toc;
  els.findInput.placeholder = L.findPh;
  els.replaceInput.placeholder = L.replacePh;
  setTitle(els.findToggle, L.findToggleTitle);
  setTitle(els.findPrev, L.prevTitle);
  setTitle(els.findNext, L.nextTitle);
  setTitle(els.findCase, L.caseTitle);
  setTitle(els.findClose, L.findCloseTitle);
  els.replaceOne.textContent = L.replaceOne;
  setTitle(els.replaceOne, L.replaceOneTitle);
  els.replaceAll.textContent = L.replaceAllBtn;
  setTitle(els.replaceAll, L.replaceAllTitle);
  setTitle(els.toggleBtn, L.toggleTitle);
  setTitle(els.minBtn, L.winMin);
  setTitle(els.maxBtn, winMaximized ? L.winRestore : L.winMax);
  setTitle(els.closeBtn, L.winClose);
  // 업데이트 배지·팝업 고정 문자열 (상태 문구는 renderUpdate가 담당)
  setTitle(els.updBtn, els.updBtn.classList.contains('avail') ? L.updNewTip : L.updTip);
  setTitle(els.updClose, L.findCloseTitle);
  els.updTitle.textContent = L.updTitle;
  els.updCurLabel.textContent = L.updCurrent;
  els.updLatestLabel.textContent = L.updLatest;
  els.updNotesLabel.textContent = L.updNotes;
  els.updCheckBtn.textContent = L.updCheckNow;
  els.updApplyBtn.textContent = L.updDo;
  if (!els.updOverlay.hidden) renderUpdate();   // 팝업이 열려 있으면 상태 문구도 새 언어로
  if (tabs.length) renderTabs();   // 탭의 닫기/새 문서 툴팁 갱신
}

// ---- 문서(탭) 상태 : 웹이 모든 버퍼를 소유, C#은 파일 입출력만 담당 ----
// 각 탭: { id, path(null=새 문서), name, text, dirty, editing,
//          scroll(미리보기), caret/selEnd/editScroll(편집 위치), img(이미지 맵) }
let tabs = [];
let activeId = null;
let nextId = 1;

// ---- 문서 내비게이션(뒤로/앞으로) : 방문한 탭 순서를 기록 (VS Code 식) ----
let navStack = [];        // 방문 순서대로 쌓인 tabId
let navIndex = -1;        // navStack 내 현재 위치
let isNavigating = false; // 뒤로/앞으로 수행 중이면 재기록 방지
const NAV_LIMIT = 50;

marked.setOptions({ gfm: true, breaks: false });
// 코드 내용은 marked가 이미 이스케이프하므로 hljs의 unescaped 경고는 불필요
if (typeof hljs !== 'undefined') hljs.configure({ ignoreUnescapedHTML: true });

function activeTab() { return tabs.find(t => t.id === activeId) || null; }

// ---- mermaid 다이어그램 렌더 (```mermaid → SVG, 테마 연동) ----
// 번들(3.4MB)은 시작 시 파싱하지 않고 mermaid 블록을 처음 만날 때 지연 로드 (시작 속도 최적화).
// 렌더 실패한 블록은 mermaid가 자리에 오류 표시를 남긴다 (앱은 계속 동작).
let mermaidRun = Promise.resolve();   // 마지막 mermaid 렌더 완료 시점 (PDF 내보내기·캐시가 대기)
let mermaidLoad = null;               // 로드 프라미스 (1회만)

function mermaidInit(theme) {
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    markdownAutoWrap: false,               // 라벨 자동 줄바꿈 해제 → 노드 폭이 내용에 맞게 늘어남
    flowchart: { wrappingWidth: 99999 },   // 노드 텍스트 최대폭(기본 200px) 제한 해제
  });
}

// 주의: mermaid.min.js는 로컬 패치됨 — createText 기본 width:u=200 → 99999.
// 엣지(화살표) 라벨 호출부가 flowchart.wrappingWidth 설정을 무시하고 기본값 200px에서
// 줄바꿈하는 mermaid 자체 한계 때문. 번들을 새 버전으로 교체하면 같은 패치를 다시 적용할 것.
function ensureMermaid() {
  if (typeof mermaid !== 'undefined') return Promise.resolve(true);
  if (!mermaidLoad) {
    mermaidLoad = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'mermaid.min.js';
      s.onload = () => {
        mermaidInit(currentTheme());
        resolve(true);
      };
      s.onerror = () => resolve(false);   // 로드 실패 → 다이어그램 원문 텍스트로 표시
      document.head.appendChild(s);
    });
  }
  return mermaidLoad;
}

function renderMermaid() {
  const blocks = els.preview.querySelectorAll('pre > code.language-mermaid');
  if (!blocks.length) { mermaidRun = Promise.resolve(); return; }
  const nodes = [];
  for (const code of blocks) {
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = code.textContent || '';
    code.parentElement.replaceWith(div);
    nodes.push(div);
  }
  // 블록별로 독립·순차 실행 — mermaid.run은 첫 오류에서 중단되므로 나눠 돌려 오류를 격리하되
  // (오류 블록 자리엔 오류 표시, 나머지는 정상 렌더), 동시 실행은 내부 렌더 id 충돌로
  // 일부 SVG가 유실될 수 있어 반드시 순차로 기다린다.
  mermaidRun = ensureMermaid()
    .then(async (ok) => {
      if (!ok) return;
      for (const n of nodes) {
        try { await mermaid.run({ nodes: [n] }); } catch (_) { /* 해당 블록만 오류 표시 */ }
      }
    })
    .catch(() => {});
}

// PDF 내보내기: 일반 콘텐츠는 @media print CSS가 라이트로 강제하지만,
// mermaid SVG는 렌더 시점 테마가 박제되므로 인쇄 직전 라이트로 재렌더 → 인쇄 후 복원한다.
async function applyPrintTheme(light) {
  await mermaidRun;                                // 지연 로드·렌더가 진행 중이면 끝날 때까지 대기
  const t = activeTab();
  const needsSwap = typeof mermaid !== 'undefined'
    && currentTheme() === 'dark'
    && t && !els.preview.hidden
    && els.preview.querySelector('.mermaid');
  if (needsSwap) {
    mermaidInit(light ? 'light' : 'dark');
    saveScroll();
    render(true);                                  // 캐시 우회 — mermaid 테마가 바뀌었으므로 강제 재렌더
    await mermaidRun;                              // SVG 완성 후에 인쇄 신호
    els.preview.scrollTop = t.scroll;
  }
  if (light && host) host.postMessage({ cmd: 'printThemeReady' });
}

// ---- 테마 (다크/라이트) ----
function applyTheme(theme) {           // 'dark' | 'light'  (전환은 타이틀바 🌙/☀ 버튼)
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (_) {}
  updateThemeTitle();                  // 버튼 툴팁을 "누르면 바뀔 테마"로 갱신
  // mermaid는 테마가 SVG에 박제되므로 재초기화 후 미리보기를 다시 그림
  if (typeof mermaid !== 'undefined') {
    mermaidInit(theme);
    if (!els.preview.hidden && activeTab()) render();
  }
  // C#에 알려 다음 실행 시 로딩 스플래시 색을 이 테마에 맞춤
  if (host) host.postMessage({ cmd: 'theme', value: theme });
}
function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (_) {}
  const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (sysDark ? 'dark' : 'light'));
}
initTheme();
applyLocale();

// ---- 렌더 / 편집 모드 ----
// 렌더 캐시: 내용·테마·이미지 맵이 그대로면 완성된 HTML(완성 SVG 포함)을 복원만 한다
// → 큰 문서의 탭 전환·편집↔미리보기 토글이 즉시가 되고, mermaid 재렌더 깜빡임도 없음.
// 캐시는 mermaid까지 끝난 시점에 저장하며, 키(text/theme/img) 불일치로 자동 무효화된다.
const HTML_CACHE_MAX = 8 * 1024 * 1024;   // data URI 중복 보관 상한 (초과 시 캐시 안 함)

function render(force) {
  const t = activeTab();
  const theme = currentTheme();
  if (!force && t && t.html !== undefined
      && t.htmlText === t.text && t.htmlTheme === theme && t.htmlImg === t.img) {
    els.preview.innerHTML = t.html;    // 캐시 복원 (marked/mermaid/hljs 생략)
    mermaidRun = Promise.resolve();    // 캐시 속 SVG는 이미 완성본
    applyToc();
    if (!els.findbar.hidden && find.mode === 'preview') recomputeMatches(true);
    return;
  }
  // .md-body로 감싸 좌우 여백 적용 (스크롤바는 전체 너비 #preview에 유지)
  els.preview.innerHTML = '<div class="md-body">' + marked.parse((t ? t.text : '') || '') + '</div>';
  assignHeadingIds();                  // 헤딩에 id 부여 → 문서 내 #앵커 링크 이동 지원
  applyImageMap(t ? t.img : null);     // 로컬 이미지 src를 로드 가능한 URL로 교체
  renderMermaid();
  highlightCode();
  applyToc();                          // 목차가 켜져 있으면 새 내용 기준으로 재생성
  // 미리보기 찾기가 열려 있으면 새 DOM 기준으로 매치 재계산 (외부 변경 반영 등)
  if (!els.findbar.hidden && find.mode === 'preview') recomputeMatches(true);
  if (t) {
    const text = t.text, img = t.img;
    mermaidRun.then(() => {            // mermaid 완료 시점에 상태가 그대로일 때만 저장
      if (activeTab() !== t || t.text !== text || t.img !== img || currentTheme() !== theme) return;
      const html = els.preview.innerHTML;
      if (html.length > HTML_CACHE_MAX) { t.html = undefined; return; }
      t.html = html;
      t.htmlText = text;
      t.htmlTheme = theme;
      t.htmlImg = img;
    });
  }
}

// 언어가 명시된 코드 블록만 하이라이팅 (콘솔 출력 등 일반 블록은 그대로 둠)
// mermaid 블록은 renderMermaid가 먼저 SVG로 치환하므로 여기 오지 않는다.
function highlightCode() {
  if (typeof hljs === 'undefined') return;
  els.preview.querySelectorAll('.md-body pre code[class*="language-"]').forEach((c) => {
    hljs.highlightElement(c);
  });
}

// ---- 목차 사이드바 (미리보기 전용, 토글 상태는 localStorage에 유지) ----
let tocOn = false;
try { tocOn = localStorage.getItem('toc') === '1'; } catch (_) {}

let tocEntries = [];   // [{ h(헤딩 요소), item(목차 항목) }] — 현재 위치 하이라이트용
let tocRaf = 0;
let tocClicked = null; // 클릭으로 이동한 항목 — 문서 끝 섹션은 헤딩이 상단까지 못 와도 강조 유지

function buildToc() {
  els.tocList.innerHTML = '';
  tocEntries = [];
  tocClicked = null;
  const hs = els.preview.querySelectorAll('.md-body h1, .md-body h2, .md-body h3, .md-body h4');
  for (const h of hs) {
    const item = document.createElement('div');
    item.className = 'toc-item toc-' + h.tagName.toLowerCase();
    item.textContent = h.textContent;
    item.title = h.textContent;
    const entry = { h, item };
    item.addEventListener('click', () => {
      tocClicked = entry;
      h.scrollIntoView({ behavior: SMOOTH, block: 'start' });
      els.preview.focus({ preventScroll: true });   // 목차 클릭 후에도 키 스크롤 유지
    });
    els.tocList.appendChild(item);
    tocEntries.push(entry);
  }
  updateTocActive();
}

// 미리보기 스크롤 위치에 해당하는 목차 항목을 강조 (scroll-spy)
function updateTocActive() {
  if (els.toc.hidden || !tocEntries.length) return;
  const pr = els.preview.getBoundingClientRect();
  let cur = tocEntries[0];
  for (const en of tocEntries) {
    if (en.h.getBoundingClientRect().top - pr.top <= 28) cur = en;
    else break;
  }
  // 클릭한 항목의 헤딩이 화면 안에 보이는 동안은 그 항목을 우선 강조
  // (문서 끝 섹션은 상단까지 스크롤될 수 없어 scroll-spy만으로는 이전 항목이 잡힘)
  if (tocClicked && tocClicked.h.isConnected) {
    const ht = tocClicked.h.getBoundingClientRect().top;
    if (ht >= pr.top - 4 && ht < pr.bottom) cur = tocClicked;
  }
  for (const en of tocEntries) en.item.classList.toggle('active', en === cur);
  cur.item.scrollIntoView({ block: 'nearest' });   // 긴 목차에서도 현재 항목이 보이게
}

els.preview.addEventListener('scroll', () => {
  if (tocRaf) return;
  tocRaf = requestAnimationFrame(() => { tocRaf = 0; updateTocActive(); });
});
// 사용자가 직접 스크롤을 움직이면 클릭 고정 해제 → 일반 scroll-spy로 복귀
for (const ev of ['wheel', 'mousedown', 'keydown']) {
  els.preview.addEventListener(ev, () => { tocClicked = null; }, { passive: true });
}

function applyToc() {
  const preview = !els.preview.hidden;
  const show = tocOn && preview;               // 편집 모드에서는 숨김
  els.toc.hidden = !show;
  // 목차가 열리면 ☰ 버튼이 패널 헤더(제목 왼쪽)로 들어가고 레일은 사라짐, 닫으면 레일로 복귀.
  // 두 위치는 화면상 같은 좌표라 버튼이 움직여 보이지 않음 (#tocHead margin 보정)
  els.tocRail.hidden = !preview || show;
  if (show) els.tocHead.prepend(els.tocBtn);
  else els.tocRail.appendChild(els.tocBtn);
  els.tocBtn.classList.toggle('active', tocOn);
  if (show) buildToc();
}

els.tocBtn.addEventListener('click', () => {
  tocOn = !tocOn;
  try { localStorage.setItem('toc', tocOn ? '1' : '0'); } catch (_) {}
  const t = activeTab();
  if (tocOn && t && t.editing) setMode(false);   // 편집 중 켜면 미리보기로 전환해 바로 보여줌
  else applyToc();
});

// 미리보기의 로컬 이미지 src를 C#이 인라인해 준 data URI로 교체 → 이미지 깨짐 방지
// marked는 src를 URL 인코딩해 내보내므로(공백 %20·한글 %EA…), 원문 키와 어긋나면 디코딩해 재조회.
function applyImageMap(map) {
  if (!map) return;
  els.preview.querySelectorAll('.md-body img').forEach((img) => {
    const raw = img.getAttribute('src') || '';
    const hit = map[raw] || map[safeDecode(raw)];
    if (hit) img.setAttribute('src', hit);
  });
}

// 헤딩 텍스트를 GitHub 식 slug로 만들어 id 부여 (중복은 -1, -2 … 접미사)
function assignHeadingIds() {
  const used = new Map();
  els.preview.querySelectorAll('.md-body h1, .md-body h2, .md-body h3, .md-body h4, .md-body h5, .md-body h6')
    .forEach((h) => {
      let slug = slugify(h.textContent || '');
      if (!slug) return;
      if (used.has(slug)) { const n = used.get(slug) + 1; used.set(slug, n); slug += '-' + n; }
      else used.set(slug, 0);
      h.id = slug;
    });
}
function slugify(s) {
  return s.trim().toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')      // 단어문자·공백·하이픈·한글만 남김
    .replace(/\s+/g, '-');
}
function scrollToAnchor(id) {
  if (!id) return;
  const el = document.getElementById(id)
    || [...els.preview.querySelectorAll('[id]')].find((x) => x.id.toLowerCase() === id.toLowerCase())
    || document.getElementById(slugify(id));   // 앵커를 헤딩 원문 그대로 쓴 경우 폴백
  if (!el) return;
  // 목차 클릭과 동일한 우선 강조 — 문서 끝 섹션은 상단까지 스크롤될 수 없어도 목표 항목을 강조
  const entry = tocEntries.find((en) => en.h === el);
  if (entry) tocClicked = entry;
  el.scrollIntoView({ behavior: SMOOTH, block: 'start' });
}
// 인코딩이 깨진 앵커(%가 홀로 있는 등)로 decodeURIComponent가 던지는 예외 방어
function safeDecode(s) {
  try { return decodeURIComponent(s); } catch (_) { return s; }
}

// 미리보기가 보일 때 현재 탭의 스크롤 위치를 저장
function saveScroll() {
  const t = activeTab();
  if (t && !els.preview.hidden) t.scroll = els.preview.scrollTop;
}

function applyMode(edit) {
  els.editor.hidden = !edit;
  els.preview.hidden = edit;             // 목차 레일/패널 표시는 applyToc가 관리 (미리보기 전용)
  els.fmtbar.hidden = !edit;             // 서식 바는 편집 모드 전용
  els.toggleBtn.classList.toggle('active', edit);   // active가 배경 틴트 + 아이콘(연필↔눈) 전환
  if (edit) {
    hideFind();                        // 미리보기 찾기 바는 편집으로 넘어가면 닫음
    applyToc();                        // 편집 모드에서는 목차 숨김
    els.editor.focus();
  } else {
    hideFind();                        // 미리보기로 나가면 찾기 바 닫음 (편집 모드 전용)
    render();                          // 미리보기로 전환 시 즉시 반영 (목차 갱신 포함)
    els.preview.scrollTop = activeTab()?.scroll || 0;   // 저장된 스크롤 위치 복원
    els.preview.focus({ preventScroll: true });         // 클릭 없이 바로 PageDown/화살표 스크롤 가능
  }
}

function setMode(edit) {
  const t = activeTab();
  if (!t) return;
  let sync = null;
  if (edit) {
    saveScroll();                        // 편집 진입 전 미리보기 위치 저장
    // 미리보기를 움직였을 때만 대응 편집 위치로 매핑 (안 움직였으면 이전 편집 위치 복원)
    if (t.syncBase === undefined || t.scroll !== t.syncBase) sync = measurePreviewPos();
  } else {
    captureEditState(t);                 // 편집 → 미리보기: 최신 내용 + 편집 위치 보존
    sync = measureEditorPos(t);          // 편집기가 보이는 지금 위치 측정
  }
  t.editing = edit;
  applyMode(edit);
  if (edit) {
    restoreCaret(t);
    if (sync) applyEditorPos(t, sync);   // 미리보기 위치 → 대응 편집 스크롤
  } else {
    if (sync) applyPreviewPos(t, sync);  // 편집 위치 → 대응 미리보기 스크롤
    saveScroll();                        // 동기화된 위치를 새 기준으로
    t.syncBase = els.preview.scrollTop;
  }
  if (mirrorEl) mirrorEl.textContent = '';   // 측정용 본문 사본 해제 (큰 문서 메모리 회수)
}

// ---- 편집 ↔ 미리보기 스크롤 동기화 ----
// 소스의 ATX 헤딩(#)과 렌더된 h1~h6가 1:1 대응하면 헤딩 구간을 줄 단위로 보간해 매핑하고,
// 대응이 깨지면(setext 헤딩·인용문 내 헤딩 등) 전체 비율로 폴백한다.
// 편집기의 자동 줄바꿈(word wrap) 높이는 textarea와 동일 폭/타이포의 미러 요소로 계산.

let mirrorEl = null;
function editorMirror() {
  if (!mirrorEl) {
    mirrorEl = document.createElement('div');
    mirrorEl.id = 'editorMirror';
    document.body.appendChild(mirrorEl);
  }
  const cs = getComputedStyle(els.editor);
  mirrorEl.style.font = cs.font;
  mirrorEl.style.lineHeight = cs.lineHeight;
  mirrorEl.style.tabSize = cs.tabSize;
  mirrorEl.style.width = (els.editor.clientWidth
    - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) + 'px';
  return mirrorEl;
}

// 소스 lines의 앞 k줄이 편집기에서 차지하는 높이(px)
// 끝의 ZWSP(폭 0)는 마지막 줄이 빈 줄이어도 높이를 갖게 하는 장치 (pre-wrap은 후행 빈 줄을 접음)
function lineOffsetPx(lines, k) {
  if (k <= 0) return 0;
  const m = editorMirror();
  m.textContent = lines.slice(0, k).join('\n') + '​';
  return m.offsetHeight;
}

// 편집 스크롤(px, 패딩 제외) → 소스 줄 번호 (이분 탐색)
function editorPxToLine(lines, px) {
  let lo = 0, hi = lines.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineOffsetPx(lines, mid) <= px) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// ``` 펜스 밖의 ATX 헤딩(#…) 줄 번호 목록
function sourceHeadingLines(text) {
  const res = [];
  let fence = false;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) { fence = !fence; continue; }
    if (!fence && /^ {0,3}#{1,6}\s/.test(lines[i])) res.push(i);
  }
  return res;
}

function domHeadings() {
  return [...els.preview.querySelectorAll(
    '.md-body h1, .md-body h2, .md-body h3, .md-body h4, .md-body h5, .md-body h6')];
}
function previewTopOf(el) {
  return el.getBoundingClientRect().top - els.preview.getBoundingClientRect().top + els.preview.scrollTop;
}

// 편집기가 보일 때: 화면 상단의 소스 줄(소수부는 줄 내 진행률) + 비율 폴백값
function measureEditorPos(t) {
  const cs = getComputedStyle(els.editor);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const px = Math.max(0, els.editor.scrollTop - padTop);
  const lines = t.text.split('\n');
  const line = editorPxToLine(lines, px);
  const y0 = lineOffsetPx(lines, line), y1 = lineOffsetPx(lines, line + 1);
  const max = els.editor.scrollHeight - els.editor.clientHeight;
  return {
    line: line + (y1 > y0 ? (px - y0) / (y1 - y0) : 0),
    ratio: max > 0 ? els.editor.scrollTop / max : 0,
  };
}

// 미리보기로 전환한 뒤: 소스 줄 → 헤딩 구간 보간으로 미리보기 스크롤 적용
function applyPreviewPos(t, pos) {
  const srcH = sourceHeadingLines(t.text);
  const domH = domHeadings();
  if (srcH.length && srcH.length === domH.length) {
    const total = t.text.split('\n').length;
    let i = -1;
    while (i + 1 < srcH.length && srcH[i + 1] <= pos.line) i++;
    const startLine = i >= 0 ? srcH[i] : 0;
    const endLine = i + 1 < srcH.length ? srcH[i + 1] : total;
    const startY = i >= 0 ? previewTopOf(domH[i]) : 0;
    const endY = i + 1 < domH.length ? previewTopOf(domH[i + 1]) : els.preview.scrollHeight;
    const frac = endLine > startLine ? (pos.line - startLine) / (endLine - startLine) : 0;
    els.preview.scrollTop = Math.max(0, startY + frac * (endY - startY));
  } else {
    const max = els.preview.scrollHeight - els.preview.clientHeight;
    els.preview.scrollTop = pos.ratio * Math.max(0, max);
  }
}

// 미리보기가 보일 때: 상단 기준 헤딩 구간과 진행률 + 비율 폴백값
function measurePreviewPos() {
  const sTop = els.preview.scrollTop;
  const domH = domHeadings();
  let i = -1;
  while (i + 1 < domH.length && previewTopOf(domH[i + 1]) <= sTop + 8) i++;
  const startY = i >= 0 ? previewTopOf(domH[i]) : 0;
  const endY = i + 1 < domH.length ? previewTopOf(domH[i + 1]) : els.preview.scrollHeight;
  const max = els.preview.scrollHeight - els.preview.clientHeight;
  return {
    idx: i,
    frac: endY > startY ? (sTop - startY) / (endY - startY) : 0,
    count: domH.length,
    ratio: max > 0 ? sTop / max : 0,
  };
}

// 편집으로 전환한 뒤: 헤딩 구간 진행률 → 소스 줄 → 편집 스크롤 적용
function applyEditorPos(t, pos) {
  const srcH = sourceHeadingLines(t.text);
  const lines = t.text.split('\n');
  const cs = getComputedStyle(els.editor);
  const padTop = parseFloat(cs.paddingTop) || 0;
  if (srcH.length && srcH.length === pos.count) {
    const startLine = pos.idx >= 0 ? srcH[pos.idx] : 0;
    const endLine = pos.idx + 1 < srcH.length ? srcH[pos.idx + 1] : lines.length;
    const lineF = startLine + pos.frac * (endLine - startLine);
    const li = Math.min(Math.floor(lineF), lines.length);
    const y0 = lineOffsetPx(lines, li), y1 = lineOffsetPx(lines, li + 1);
    els.editor.scrollTop = padTop + y0 + (lineF - li) * Math.max(0, y1 - y0);
  } else {
    const max = els.editor.scrollHeight - els.editor.clientHeight;
    els.editor.scrollTop = pos.ratio * Math.max(0, max);
  }
}

// 현재 에디터의 내용·커서·스크롤을 탭에 보존 (restoreCaret과 짝)
function captureEditState(t) {
  t.text = els.editor.value;
  t.caret = els.editor.selectionStart;
  t.selEnd = els.editor.selectionEnd;
  t.editScroll = els.editor.scrollTop;
}

// 저장해 둔 편집 커서/선택/스크롤 복원 (textarea는 value 재할당 시 위치가 초기화됨)
function restoreCaret(t) {
  const len = els.editor.value.length;
  els.editor.setSelectionRange(Math.min(t.caret || 0, len), Math.min(t.selEnd || 0, len));
  els.editor.scrollTop = t.editScroll || 0;
}

// ---- 상태 통지 (창 제목 / 닫기 가드) ----
function sendState() {
  if (!host) return;
  const t = activeTab();
  host.postMessage({
    cmd: 'state',
    name: t ? t.name : '새 문서',
    activeDirty: t ? t.dirty : false,
    anyDirty: tabs.some(x => x.dirty),
    paths: tabs.filter(x => x.path).map(x => x.path),   // C#의 외부 변경 감시 대상
  });
  saveSession();                       // 탭 구성이 바뀔 때마다 세션 스냅샷 (다음 실행 복원용)
}

function setDirty(v) {
  const t = activeTab();
  if (!t || t.dirty === v) return;
  t.dirty = v;
  renderTabs();
  sendState();
}

// ---- 탭 열기 / 전환 / 닫기 ----
function openOrFocus(doc) {
  // 같은 경로가 이미 열려 있으면 새로 만들지 않고 그 탭으로 이동 (중복 방지)
  if (doc.path) {
    const exist = tabs.find(t => t.path === doc.path);
    if (exist) { focusTab(exist.id); return; }
  }
  // 파일을 여는데 유일한 탭이 아무것도 입력하지 않은 새 문서면 자리를 내주고 사라짐 (VS Code 방식)
  const pristine = (doc.path && tabs.length === 1 && !tabs[0].path && !tabs[0].dirty)
    ? tabs[0] : null;
  const tab = {
    id: nextId++,
    path: doc.path || null,
    name: doc.name || L.newDoc,
    text: doc.text || '',
    dirty: false,
    editing: false,
    scroll: 0,               // 미리보기 스크롤 위치 (탭 전환/뒤로가기 시 복원)
    caret: 0,                // 편집 커서(선택 시작)·선택 끝·편집 스크롤 — 탭 전환 시 복원
    selEnd: 0,
    editScroll: 0,
    img: doc.img || null,    // { 원본src: 로드가능URL } — 로컬 이미지 표시용 (C#이 제공)
  };
  tabs.push(tab);
  focusTab(tab.id);
  if (doc.path) pushRecent(doc.path);
  // focusTab의 captureEditState 이후에 판정 — 사용자가 입력한 내용이 있으면 남긴다
  if (pristine && !pristine.dirty && !(pristine.text || '').length) removeTabSilently(pristine.id);
}

// 확인 없이 탭 제거 (빈 새 문서 정리용) — 히스토리에서도 지움
function removeTabSilently(id) {
  const idx = tabs.findIndex(t => t.id === id);
  if (idx < 0) return;
  tabs.splice(idx, 1);
  const removedUpToCur = navStack.slice(0, navIndex + 1).filter(x => x === id).length;
  navStack = navStack.filter(x => x !== id);
  navIndex -= removedUpToCur;
  if (navIndex > navStack.length - 1) navIndex = navStack.length - 1;
  renderTabs();
  sendState();
  updateNavButtons();
}

// 탭 순환 (Ctrl+Tab / Ctrl+Shift+Tab / Ctrl+PgDn / Ctrl+PgUp)
function cycleTab(delta) {
  if (tabs.length < 2) return;
  const i = tabs.findIndex(t => t.id === activeId);
  focusTab(tabs[(i + delta + tabs.length) % tabs.length].id);
}

function focusTab(id) {
  if (id === activeId) return;             // 같은 탭 재클릭: 상태 변화 없음 (재렌더로 인한 mermaid 깜빡임·찾기바 닫힘 방지)
  hideFind();                              // 탭을 바꾸면 찾기 바는 이전 문서 기준이므로 닫음
  saveScroll();                            // 현재 탭 스크롤 위치 보존
  const cur = activeTab();
  if (cur) captureEditState(cur);          // 떠나는 탭의 미저장 입력·커서 보존
  activeId = id;
  const t = activeTab();
  if (!t) return;
  els.editor.value = t.text;
  applyMode(t.editing);                    // 탭별 편집/미리보기 상태 복원 (미리보기면 render 포함)
  if (t.editing) restoreCaret(t);          // 편집 탭이면 커서/스크롤 위치 복원
  recordVisit(id);                         // 방문 히스토리 기록 (뒤로/앞으로 이동 중엔 건너뜀)
  renderTabs();
  sendState();
  updateNavButtons();
}

// ---- 방문 히스토리 조작 ----
function recordVisit(id) {
  if (isNavigating) return;                // 뒤로/앞으로로 이동한 것은 새 기록이 아님
  if (navStack[navIndex] === id) return;   // 직전과 동일하면 무시
  navStack.length = navIndex + 1;          // 앞으로(forward) 구간은 새 이동 시 삭제
  navStack.push(id);
  if (navStack.length > NAV_LIMIT) navStack.shift();
  navIndex = navStack.length - 1;
}

function tabAlive(id) { return tabs.some(t => t.id === id); }

function goBack() {
  let i = navIndex - 1;
  while (i >= 0 && !tabAlive(navStack[i])) i--;   // 닫힌 탭은 건너뜀
  if (i < 0) return;
  navIndex = i;
  navigateTo(navStack[i]);
}

function goForward() {
  let i = navIndex + 1;
  while (i < navStack.length && !tabAlive(navStack[i])) i++;
  if (i >= navStack.length) return;
  navIndex = i;
  navigateTo(navStack[i]);
}

function navigateTo(id) {
  isNavigating = true;
  focusTab(id);
  isNavigating = false;
  updateNavButtons();
}

function canGoBack() {
  for (let i = navIndex - 1; i >= 0; i--) if (tabAlive(navStack[i])) return true;
  return false;
}
function canGoForward() {
  for (let i = navIndex + 1; i < navStack.length; i++) if (tabAlive(navStack[i])) return true;
  return false;
}
function updateNavButtons() {
  els.backBtn.disabled = !canGoBack();
  els.fwdBtn.disabled = !canGoForward();
}

function closeTab(id) {
  const idx = tabs.findIndex(t => t.id === id);
  if (idx < 0) return;
  const t = tabs[idx];
  if (t.dirty && !window.confirm(L.closeConfirm(t.name))) return;

  const wasActive = (id === activeId);
  tabs.splice(idx, 1);
  backupNow();                                 // 닫힌 탭 반영해 백업 갱신

  // 히스토리에서 닫힌 탭 제거 + 현재 위치 보정
  const removedUpToCur = navStack.slice(0, navIndex + 1).filter(x => x === id).length;
  navStack = navStack.filter(x => x !== id);
  navIndex -= removedUpToCur;
  if (navIndex > navStack.length - 1) navIndex = navStack.length - 1;

  if (wasActive) {
    activeId = null;
    if (tabs.length) {
      // 히스토리상 현재 위치의 탭이 살아 있으면 그것으로, 아니면 인접 탭으로
      let target = navStack[navIndex];
      if (!tabAlive(target)) target = tabs[Math.min(idx, tabs.length - 1)].id;
      navigateTo(target);                                        // 닫기 복귀는 새 기록이 아님
    } else {
      openOrFocus({ path: null, name: L.newDoc, text: '' });    // 최소 1개 유지
    }
  } else {
    renderTabs();
    sendState();
  }
  updateNavButtons();
}

// ---- 탭 드래그 재정렬 ----
let dragTabId = null;

function reorderTab(fromId, toId) {
  if (fromId == null || fromId === toId) return;
  const from = tabs.findIndex(x => x.id === fromId);
  const to = tabs.findIndex(x => x.id === toId);
  if (from < 0 || to < 0) return;
  const [moved] = tabs.splice(from, 1);
  tabs.splice(to, 0, moved);
  renderTabs();
}

function renderTabs() {
  els.tabs.innerHTML = '';
  for (const t of tabs) {
    const el = document.createElement('div');
    el.className = 'tab' + (t.id === activeId ? ' active' : '');
    el.title = t.path || t.name;

    // 드래그로 순서 변경
    el.draggable = true;
    el.addEventListener('dragstart', (e) => {
      dragTabId = t.id;
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragover', (e) => {
      e.preventDefault();                       // 드롭 허용
      e.dataTransfer.dropEffect = 'move';
      if (dragTabId !== null && dragTabId !== t.id) el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', (e) => {
      el.classList.remove('drag-over');
      if (dragTabId === null) return;           // 탭 드래그가 아니면(파일 드롭) window 핸들러에 맡김
      e.preventDefault();
      e.stopPropagation();
      reorderTab(dragTabId, t.id);
    });
    el.addEventListener('dragend', () => { dragTabId = null; });

    // 우클릭 메뉴 (닫기 · 탐색기에서 보기 등)
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showTabMenu(e.clientX, e.clientY, t.id);
    });

    if (t.dirty) {
      const dot = document.createElement('span');
      dot.className = 'tab-dot';
      dot.textContent = '●';
      el.appendChild(dot);
    }
    const label = document.createElement('span');
    label.className = 'tab-label';
    label.textContent = t.name;
    el.appendChild(label);

    const close = document.createElement('button');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = L.tabClose;
    close.addEventListener('click', (e) => { e.stopPropagation(); closeTab(t.id); });
    el.appendChild(close);

    el.addEventListener('click', () => focusTab(t.id));
    els.tabs.appendChild(el);
  }

  // 탭 줄 끝의 새 문서(+) 버튼
  const plus = document.createElement('button');
  plus.className = 'tab-new';
  plus.title = L.tabNew;
  plus.textContent = '+';
  plus.addEventListener('click', newDoc);
  els.tabs.appendChild(plus);
}

function newDoc() {
  openOrFocus({ path: null, name: L.newDoc, text: '' });
}

// ---- 파일 동작 ----
function save() {
  const t = activeTab();
  if (!t) return;
  if (t.editing) t.text = els.editor.value;  // 편집 중이면 최신값 반영
  if (host) host.postMessage({ cmd: 'save', id: t.id, path: t.path, text: t.text });
}

function openFile() {
  if (host) host.postMessage({ cmd: 'open' });
}

function toggleMode() {
  const t = activeTab();
  if (t) setMode(!t.editing);
}

function exportPdf() {
  const t = activeTab();
  if (!t) return;
  if (t.editing) setMode(false);       // 미리보기에 보이는 그대로 PDF로 (인쇄 CSS 적용)
  if (host) host.postMessage({ cmd: 'exportPdf', name: t.name });
}

// ---- 하단 토스트 알림 ----
let toastTimer = null;
function toast(text) {
  els.toast.textContent = text;
  els.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2400);
}

// 실행 취소(Ctrl+Z) 히스토리를 보존하는 편집기 구간 교체.
// value 재할당은 undo 스택을 파괴하므로 브라우저 편집 명령으로 수행하고, 미지원 시에만 폴백.
function editText(start, end, text) {
  const ta = els.editor;
  if (start === end && !text) return;
  ta.focus();
  ta.setSelectionRange(start, end);
  let ok = false;
  try { ok = document.execCommand(text ? 'insertText' : 'delete', false, text || undefined); }
  catch (_) { ok = false; }
  if (!ok) {
    const v = ta.value;
    ta.value = v.slice(0, start) + text + v.slice(end);
  }
}

// ---- 편집 서식 단축키 (Ctrl+B 굵게 · Ctrl+I 기울임) ----
// 선택 영역을 마커로 감싸고, 이미 감싸져 있으면 해제(토글). 선택이 없으면 마커 사이에 커서.
function wrapSelection(marker) {
  const t = activeTab();
  if (!t || !t.editing || document.activeElement !== els.editor) return;
  const ta = els.editor;
  const s = ta.selectionStart, e = ta.selectionEnd;
  const v = ta.value;
  const sel = v.slice(s, e);
  const n = marker.length;

  if (v.slice(s - n, s) === marker && v.slice(e, e + n) === marker) {
    editText(s - n, e + n, sel);                              // 바깥 마커 해제
    ta.setSelectionRange(s - n, e - n);
  } else if (sel.length >= n * 2 && sel.startsWith(marker) && sel.endsWith(marker)) {
    const inner = sel.slice(n, sel.length - n);               // 선택에 포함된 마커 해제
    editText(s, e, inner);
    ta.setSelectionRange(s, s + inner.length);
  } else {
    editText(s, e, marker + sel + marker);
    ta.setSelectionRange(s + n, e + n);
  }
  setDirty(true);
  if (!els.findbar.hidden) recomputeMatches(true);
}

// ---- 서식 바 · 컨텍스트 메뉴 공용 서식 헬퍼 (모두 undo 보존) ----

// 선택이 걸친 줄 전체 범위 [ls, le)
function selectedLineRange() {
  const v = els.editor.value, s = els.editor.selectionStart, e = els.editor.selectionEnd;
  const ls = v.lastIndexOf('\n', s - 1) + 1;
  let le = v.indexOf('\n', e);
  if (le === -1) le = v.length;
  return [ls, le];
}

// 선택된 줄들을 fn(lines)->lines 로 변환해 교체 (줄 프리픽스 토글류 공용)
function transformLines(fn) {
  const t = activeTab();
  if (!t || !t.editing) return;
  const ta = els.editor;
  ta.focus();
  const [ls, le] = selectedLineRange();
  const before = ta.value.slice(ls, le);
  const out = fn(before.split('\n')).join('\n');
  if (out === before) return;
  editText(ls, le, out);
  ta.setSelectionRange(ls, ls + out.length);
  setDirty(true);
}

// 줄 프리픽스 토글: 비어 있지 않은 모든 줄에 이미 있으면 제거, 아니면 추가.
// make(n)의 n은 프리픽스를 붙인 줄의 순번 (번호 목록용)
function toggleLinePrefix(strip, make) {
  transformLines((lines) => {
    const target = lines.filter((l) => l.trim() !== '');
    const allOn = target.length > 0 && target.every((l) => strip.test(l));
    let n = 0;
    return lines.map((l) => {
      if (l.trim() === '') return l;
      const bare = l.replace(strip, '');
      return allOn ? bare : make(n++) + bare;
    });
  });
}

// 제목 토글: 이미 그 레벨이면 해제, 다른 레벨이면 교체
function toggleHeading(n) {
  const prefix = '#'.repeat(n) + ' ';
  transformLines((lines) => {
    const target = lines.filter((l) => l.trim() !== '');
    const allOn = target.length > 0 && target.every((l) => l.startsWith(prefix));
    return lines.map((l) => {
      if (l.trim() === '') return l;
      const bare = l.replace(/^#{1,6} /, '');
      return allOn ? bare : prefix + bare;
    });
  });
}

// 코드: 한 줄 선택은 인라인 `…`, 여러 줄이면 ``` 펜스 감싸기/해제
function toggleCodeFmt() {
  const ta = els.editor;
  if (!ta.value.slice(ta.selectionStart, ta.selectionEnd).includes('\n')) {
    wrapSelection('`');
    return;
  }
  transformLines((lines) => {
    if (lines.length >= 2 && lines[0].startsWith('```') && lines[lines.length - 1].startsWith('```'))
      return lines.slice(1, -1);
    return ['```', ...lines, '```'];
  });
}

// 링크 삽입: 선택을 텍스트로 쓰고, 주소 자리를 선택해 둬 바로 타이핑으로 교체
function insertLink() {
  const t = activeTab();
  if (!t || !t.editing) return;
  const ta = els.editor;
  ta.focus();
  const s = ta.selectionStart, e = ta.selectionEnd;
  const text = ta.value.slice(s, e) || L.fmtLinkText;
  const url = L.fmtLinkUrl;
  editText(s, e, `[${text}](${url})`);
  const us = s + text.length + 3;                 // "[" + 텍스트 + "](" 다음
  ta.setSelectionRange(us, us + url.length);
  setDirty(true);
}

// 블록 삽입(표·구분선): 앞뒤가 빈 줄로 분리되도록 개행 보정 (예: --- 가 제목으로 해석되는 것 방지)
function insertBlock(block) {
  const t = activeTab();
  if (!t || !t.editing) return;
  const ta = els.editor;
  ta.focus();
  const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
  const head = v.slice(0, s), tail = v.slice(e);
  const pre = head === '' || /\n\n$/.test(head) ? '' : (head.endsWith('\n') ? '\n' : '\n\n');
  const post = tail === '' || /^\n\n/.test(tail) ? '' : (tail.startsWith('\n') ? '\n' : '\n\n');
  editText(s, e, pre + block + post);
  const caret = s + pre.length + block.length;
  ta.setSelectionRange(caret, caret);
  setDirty(true);
}

function insertTable() {
  insertBlock(`| ${L.fmtCol} 1 | ${L.fmtCol} 2 |\n| --- | --- |\n|  |  |\n|  |  |`);
}

// ---- 서식 바 배선 ----
// mousedown preventDefault: 버튼 클릭이 편집기 포커스/선택을 뺏지 않게
for (const [id, act] of [
  ['fmtBold', () => wrapSelection('**')],
  ['fmtItalic', () => wrapSelection('*')],
  ['fmtStrike', () => wrapSelection('~~')],
  ['fmtH1', () => toggleHeading(1)],
  ['fmtH2', () => toggleHeading(2)],
  ['fmtH3', () => toggleHeading(3)],
  ['fmtBullet', () => toggleLinePrefix(/^- (?!\[[ xX]\] )/, () => '- ')],
  ['fmtNumber', () => toggleLinePrefix(/^\d+\. /, (n) => `${n + 1}. `)],
  ['fmtTask', () => toggleLinePrefix(/^- \[[ xX]\] /, () => '- [ ] ')],
  ['fmtQuote', () => toggleLinePrefix(/^> /, () => '> ')],
  ['fmtCode', toggleCodeFmt],
  ['fmtLink', insertLink],
  ['fmtTable', insertTable],
  ['fmtHr', () => insertBlock('---')],
]) {
  const btn = document.getElementById(id);
  btn.addEventListener('mousedown', (e) => e.preventDefault());
  // 편집기 포커스를 보장하고 실행 (wrapSelection류는 편집기 포커스 필요)
  btn.addEventListener('click', () => { els.editor.focus(); act(); });
}

// ---- 탭 우클릭 메뉴 ----
function hideTabMenu() { els.ctxmenu.hidden = true; }

function copyText(s) {
  if (!s) return;
  const done = () => toast(L.pathCopied);
  try { navigator.clipboard.writeText(s).then(done).catch(() => {}); }
  catch (_) {}
}

function closeOtherTabs(keepId) {
  // closeTab이 dirty 확인을 개별 수행 — 취소한 탭은 남는다
  for (const id of tabs.map(x => x.id)) if (id !== keepId) closeTab(id);
}

function showTabMenu(x, y, tabId) {
  const t = tabs.find(v => v.id === tabId);
  if (!t) return;
  els.ctxmenu.innerHTML = '';
  const add = (label, act, disabled) => {
    const it = document.createElement('div');
    it.className = 'ctx-item' + (disabled ? ' disabled' : '');
    it.textContent = label;
    if (!disabled) it.addEventListener('click', () => { hideTabMenu(); act(); });
    els.ctxmenu.appendChild(it);
  };
  const sep = () => {
    const s = document.createElement('div');
    s.className = 'ctx-sep';
    els.ctxmenu.appendChild(s);
  };
  add(L.ctxClose, () => closeTab(tabId));
  add(L.ctxCloseOthers, () => closeOtherTabs(tabId), tabs.length < 2);
  sep();
  add(L.ctxReveal, () => { if (host) host.postMessage({ cmd: 'reveal', path: t.path }); }, !t.path);
  add(L.ctxCopyPath, () => copyText(t.path), !t.path);

  els.ctxmenu.hidden = false;
  const r = els.ctxmenu.getBoundingClientRect();           // 화면 밖으로 나가지 않게 보정
  els.ctxmenu.style.left = Math.max(0, Math.min(x, window.innerWidth - r.width - 4)) + 'px';
  els.ctxmenu.style.top = Math.max(0, Math.min(y, window.innerHeight - r.height - 4)) + 'px';
}

document.addEventListener('click', hideTabMenu);
window.addEventListener('blur', hideTabMenu);
document.addEventListener('contextmenu', (e) => {
  // 자체 메뉴가 있는 영역(탭·미리보기·편집기)이 아니면 열린 메뉴만 닫기
  if (!e.target.closest('#tabs .tab, #preview, #editor')) hideTabMenu();
});

// ---- 최근 문서 (localStorage, MRU 최대 10) ----
const RECENT_KEY = 'recent';
const RECENT_MAX = 10;

function readRecent() {
  try {
    const a = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(a) ? a.filter((p) => typeof p === 'string') : [];
  } catch (_) { return []; }
}
function writeRecent(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX))); } catch (_) {}
}
function pushRecent(path) {
  const list = readRecent().filter((p) => p.toLowerCase() !== path.toLowerCase());
  list.unshift(path);
  writeRecent(list);
}
function dropRecent(path) {
  writeRecent(readRecent().filter((p) => p.toLowerCase() !== path.toLowerCase()));
}

// 공용 드롭다운 메뉴 빌더 — items: { label, act, disabled, tip } 또는 'sep'
// 항목 클릭은 stopPropagation: act()가 다른 메뉴를 다시 열 수 있게 (언어 하위 메뉴)
// 항목 mousedown은 preventDefault: 메뉴가 편집기 포커스/선택을 뺏지 않게 (서식·클립보드 액션용)
function buildMenu(items) {
  els.ctxmenu.innerHTML = '';
  for (const it of items) {
    if (it === 'sep') {
      const s = document.createElement('div');
      s.className = 'ctx-sep';
      els.ctxmenu.appendChild(s);
      continue;
    }
    const el = document.createElement('div');
    el.className = 'ctx-item' + (it.disabled ? ' disabled' : '');
    el.setAttribute('role', 'menuitem');            // 접근성: 스크린리더/자동화가 메뉴 항목으로 인식
    if (it.disabled) el.setAttribute('aria-disabled', 'true');
    el.textContent = it.label;
    if (it.tip) el.title = it.tip;
    el.addEventListener('mousedown', (e) => e.preventDefault());
    if (!it.disabled) el.addEventListener('click', (e) => { e.stopPropagation(); hideTabMenu(); it.act(); });
    els.ctxmenu.appendChild(el);
  }
}

function showMenuAt(items, anchor, align) {
  buildMenu(items);
  els.ctxmenu.hidden = false;
  const br = anchor.getBoundingClientRect();
  const r = els.ctxmenu.getBoundingClientRect();
  const x = align === 'right' ? br.right - r.width : br.left;
  els.ctxmenu.style.left = Math.max(0, Math.min(x, window.innerWidth - r.width - 4)) + 'px';
  els.ctxmenu.style.top = Math.max(0, Math.min(br.bottom + 4, window.innerHeight - r.height - 4)) + 'px';
}

// 좌표(우클릭 지점) 기준으로 표시 — 미리보기/편집기 컨텍스트 메뉴용
function showMenuAtPoint(items, x, y) {
  buildMenu(items);
  els.ctxmenu.hidden = false;
  const r = els.ctxmenu.getBoundingClientRect();
  els.ctxmenu.style.left = Math.max(0, Math.min(x, window.innerWidth - r.width - 4)) + 'px';
  els.ctxmenu.style.top = Math.max(0, Math.min(y, window.innerHeight - r.height - 4)) + 'px';
}

// 메뉴 버튼 공통: 열려 있으면 닫고, 아니면 연다
function menuButton(btn, show) {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();                     // document click(메뉴 닫기)보다 먼저 소비
    if (!els.ctxmenu.hidden) { hideTabMenu(); return; }
    show();
  });
}

// 최근 문서 메뉴 (열기 버튼 옆 🕘)
function showRecentMenu() {
  const list = readRecent();
  const items = [];
  if (!list.length) items.push({ label: L.noRecent, disabled: true });
  for (const p of list) {
    items.push({
      label: p.split(/[\\/]/).pop(),
      tip: p,
      act: () => { if (host) host.postMessage({ cmd: 'openPath', path: p }); },
    });
  }
  if (list.length) {
    items.push('sep');
    items.push({ label: L.ctxClearRecent, act: () => writeRecent([]) });
  }
  showMenuAt(items, els.recentBtn);
}
menuButton(els.recentBtn, showRecentMenu);

// ---- PDF·테마 버튼 (구 ⋯ 메뉴 해체 — 언어·버전만 🌐 메뉴에 남음) ----
els.pdfBtn.addEventListener('click', exportPdf);
els.themeBtn.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));

// 테마 버튼 툴팁은 "누르면 바뀔 테마"를 안내 — 로케일·테마가 바뀔 때마다 갱신
function updateThemeTitle() {
  if (!L || !els.themeBtn) return;
  setTitle(els.themeBtn, currentTheme() === 'dark' ? L.menuThemeLight : L.menuThemeDark);
}

// 언어 메뉴 — 선택은 C#(lang.txt)이 저장하고, 확정값을 app 메시지로 돌려준다
function showLangMenu() {
  const mark = (on) => (on ? '✓ ' : '  ');   // 숫자 폭 공백으로 정렬
  const items = [
    { label: mark(langMode === 'auto') + L.langAuto, act: () => setLang('auto') },
    'sep',
  ];
  for (const code of Object.keys(LANG_NAMES)) {
    items.push({ label: mark(langMode === code) + LANG_NAMES[code], act: () => setLang(code) });
  }
  showMenuAt(items, els.langBtn, 'right');
}
menuButton(els.langBtn, showLangMenu);
function setLang(mode) {
  if (host) host.postMessage({ cmd: 'lang', value: mode });
}

// 타이틀 옆 버전 클릭 → GitHub 저장소 (구 🌐 메뉴의 버전 항목에서 이동)
els.appVer.addEventListener('click', () => {
  if (host) host.postMessage({ cmd: 'openExternal', url: 'https://github.com/jjw1270/MarkdownEditor' });
});

// ---- 자동 업데이트 (타이틀 옆 ! 배지 + 팝업) ----
// 실제 확인·다운로드·적용은 C#(MainWindow.Update.cs)이 수행하고, 웹은 상태 표시만 담당.
// status: idle | checking | latest | available | downloading | extracting | restarting | fallback | error
const upd = { status: 'idle', latest: null, notes: '', pct: 0, reason: '' };

function renderUpdate() {
  const avail = upd.status === 'available';
  els.updBtn.classList.toggle('avail', avail);
  setTitle(els.updBtn, avail ? L.updNewTip : L.updTip);
  if (els.updOverlay.hidden) return;   // 팝업이 닫혀 있으면 배지만 갱신

  els.updCur.textContent = 'v' + (appVersion || '?');
  els.updLatest.textContent = upd.latest ? 'v' + upd.latest : '—';

  const msgs = {
    idle: '',
    checking: L.updChecking,
    latest: L.updUpToDate,
    available: L.updAvailable,
    downloading: L.updDownloading,
    extracting: L.updPreparing,
    restarting: L.updRestart,
    fallback: L.updFallback,
    error: upd.reason === 'space' ? L.updNoSpace : (upd.reason === 'apply' ? L.updFailed : L.updCheckFailed),
  };
  els.updMsg.textContent = msgs[upd.status] ?? '';
  els.updMsg.classList.toggle('err', upd.status === 'error');

  const busy = upd.status === 'downloading' || upd.status === 'extracting' || upd.status === 'restarting';
  els.updBarWrap.hidden = !busy;
  if (busy) {
    const ind = upd.status !== 'downloading' || upd.pct < 0;   // 비율 미상 구간 → 흐르는 바
    els.updBarFill.classList.toggle('ind', ind);
    els.updBarFill.style.width = ind ? '100%' : upd.pct + '%';
    els.updPct.textContent = ind ? '' : upd.pct + '%';
  }

  els.updNotesWrap.hidden = !upd.notes || !(avail || busy);
  els.updNotes.textContent = upd.notes || '';   // 릴리즈 본문은 텍스트로만 (스크립트/HTML 주입 차단)

  els.updCheckBtn.disabled = upd.status === 'checking' || busy;
  els.updApplyBtn.disabled = !avail;
}

function showUpdatePopup() {
  els.updOverlay.hidden = false;
  if (upd.status === 'idle') requestUpdateCheck();   // 시작 시 자동 확인이 실패/미완이면 열면서 한 번 확인
  renderUpdate();
}
function hideUpdatePopup() { els.updOverlay.hidden = true; }   // 진행 중인 다운로드는 C#에서 계속됨

function requestUpdateCheck() {
  if (!host) return;
  upd.status = 'checking';
  renderUpdate();
  host.postMessage({ cmd: 'updateCheck' });
}

els.updBtn.addEventListener('click', showUpdatePopup);
els.updClose.addEventListener('click', hideUpdatePopup);
els.updOverlay.addEventListener('click', (e) => { if (e.target === els.updOverlay) hideUpdatePopup(); });
els.updCheckBtn.addEventListener('click', requestUpdateCheck);
els.updApplyBtn.addEventListener('click', () => {
  if (!host) return;
  upd.status = 'downloading';
  upd.pct = 0;
  renderUpdate();
  host.postMessage({ cmd: 'updateApply' });
});

// ---- 세션 복원 (마지막에 열려 있던 탭) ----
// 부팅 시점 값을 먼저 읽어 둔다 — 첫 sendState의 saveSession이 키를 덮어쓰기 전에.
const SESSION_KEY = 'session';
let bootSession = null;
try { bootSession = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (_) {}

function saveSession() {
  try {
    const paths = tabs.filter((t) => t.path).map((t) => t.path);
    if (paths.length) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ paths, active: activeTab()?.path || null }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (_) {}
}

// 파일 없이 실행됐을 때(빈 새 문서) 이전 세션의 탭을 다시 연다
let sessionRestoreDone = false;
function restoreSession() {
  if (sessionRestoreDone || !host) return;
  sessionRestoreDone = true;
  const s = bootSession;
  if (!s || !Array.isArray(s.paths) || !s.paths.length) return;
  for (const p of s.paths) if (typeof p === 'string') host.postMessage({ cmd: 'openPath', path: p, quiet: true });
  if (typeof s.active === 'string') host.postMessage({ cmd: 'openPath', path: s.active, quiet: true });
}

// ---- 찾기 / 바꾸기 ----
// 편집 모드: textarea가 대상 — 매치 전체 하이라이트가 불가하므로 현재 매치를 '선택'해서 표시.
// 미리보기 모드: 렌더된 본문이 대상 — CSS Custom Highlight API로 전체 매치 + 현재 매치를 칠한다.
// 바꾸기(Ctrl+H)는 편집 모드 전용.
const find = {
  matches: [],           // (편집) 각 매치의 시작 인덱스
  index: -1,             // 현재 매치 위치
  caseSensitive: false,
  mode: 'edit',          // 'edit' | 'preview' — 찾기 바를 연 시점의 모드
};
let previewMatches = [];   // (미리보기) 각 매치의 Range

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// 현재 찾기어로 정규식 생성 (리터럴 검색 → 특수문자 이스케이프). 빈 값이면 null.
function findRegex() {
  const q = els.findInput.value;
  if (!q) return null;
  return new RegExp(escapeRegExp(q), 'g' + (find.caseSensitive ? '' : 'i'));
}

// 커서 위치 이후(같은 위치 포함)의 첫 매치 인덱스 — 없으면 0(맨 앞으로 순환)
function nearestMatchFromCaret() {
  const caret = els.editor.selectionStart;
  for (let i = 0; i < find.matches.length; i++) if (find.matches[i] >= caret) return i;
  return 0;
}

// ---- 미리보기 찾기 ----

// 본문 텍스트 노드를 훑어 매치마다 Range 생성 (mermaid SVG 내부 텍스트는 제외)
function collectPreviewMatches() {
  previewMatches = [];
  const q = els.findInput.value;
  const body = els.preview.querySelector('.md-body');
  if (!q || !body) return;
  const needle = find.caseSensitive ? q : q.toLowerCase();
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement && node.parentElement.closest('svg')) continue;
    const hay = find.caseSensitive ? node.nodeValue : node.nodeValue.toLowerCase();
    let i = 0;
    while ((i = hay.indexOf(needle, i)) !== -1) {
      const r = document.createRange();
      r.setStart(node, i);
      r.setEnd(node, i + q.length);
      previewMatches.push(r);
      i += q.length;
    }
  }
}

// 매치 전체 + 현재 매치를 하이라이트 (DOM 변형 없음 → 렌더 결과에 영향 없음)
function paintPreviewHighlights() {
  if (typeof Highlight === 'undefined' || !CSS.highlights) return;   // 미지원 → 이동만 지원
  CSS.highlights.delete('mdfind');
  CSS.highlights.delete('mdfind-cur');
  if (!previewMatches.length) return;
  CSS.highlights.set('mdfind', new Highlight(...previewMatches));
  if (find.index >= 0) CSS.highlights.set('mdfind-cur', new Highlight(previewMatches[find.index]));
}

function clearFindHighlights() {
  previewMatches = [];
  if (typeof Highlight !== 'undefined' && CSS.highlights) {
    CSS.highlights.delete('mdfind');
    CSS.highlights.delete('mdfind-cur');
  }
}

// 현재 스크롤 위치에서 처음 보이는(또는 그 아래 첫) 매치 인덱스
function nearestPreviewMatchFromScroll() {
  const pTop = els.preview.getBoundingClientRect().top;
  for (let i = 0; i < previewMatches.length; i++)
    if (previewMatches[i].getBoundingClientRect().bottom - pTop >= 0) return i;
  return 0;
}

// 현재 매치가 화면에 없으면 1/3 지점으로 스크롤해 드러냄
function revealPreviewMatch() {
  const r = previewMatches[find.index];
  if (!r) return;
  const rect = r.getBoundingClientRect();
  const pr = els.preview.getBoundingClientRect();
  if (rect.top < pr.top + 40 || rect.bottom > pr.bottom - 40)
    els.preview.scrollTop += rect.top - pr.top - pr.height / 3;
  paintPreviewHighlights();
}

// 매치를 다시 계산 (모드별 분기). keepIndex=true면 기존 위치를 최대한 유지.
function recomputeMatches(keepIndex) {
  if (find.mode === 'preview') {
    collectPreviewMatches();
    if (!previewMatches.length) find.index = -1;
    else if (keepIndex && find.index >= 0) find.index = Math.min(find.index, previewMatches.length - 1);
    else find.index = nearestPreviewMatchFromScroll();
    paintPreviewHighlights();
    updateFindCount();
    return;
  }
  const re = findRegex();
  find.matches = [];
  if (re) {
    const text = els.editor.value;
    let m;
    while ((m = re.exec(text))) {
      find.matches.push(m.index);
      if (m.index === re.lastIndex) re.lastIndex++;   // 안전장치(빈 매치 무한루프 방지)
    }
  }
  if (!find.matches.length) find.index = -1;
  else if (keepIndex && find.index >= 0) find.index = Math.min(find.index, find.matches.length - 1);
  else find.index = nearestMatchFromCaret();
  updateFindCount();
}

function matchCount() {
  return find.mode === 'preview' ? previewMatches.length : find.matches.length;
}

function updateFindCount() {
  const n = matchCount();
  els.findCount.textContent = n ? `${find.index + 1}/${n}` : (els.findInput.value ? L.noResults : '');
  const none = n === 0;
  els.findPrev.disabled = els.findNext.disabled = none;
  els.replaceOne.disabled = els.replaceAll.disabled = none || find.mode === 'preview';
}

// 현재 매치를 에디터에 선택 표시. textarea는 포커스가 있어야 스크롤되므로
// 잠깐 에디터에 포커스를 줘 위치를 드러낸 뒤 찾기 입력창으로 포커스를 되돌린다(연속 입력 유지).
function revealSelection(start, end) {
  els.editor.focus();
  els.editor.setSelectionRange(start, end);
  els.findInput.focus();
}
function selectCurrent() {
  if (find.mode === 'preview') { revealPreviewMatch(); return; }
  if (find.index < 0 || !find.matches.length) return;
  const start = find.matches[find.index];
  revealSelection(start, start + els.findInput.value.length);
}

function goToMatch(delta) {
  const n = matchCount();
  if (!n) return;
  find.index = (find.index + delta + n) % n;
  updateFindCount();
  selectCurrent();
}

// 현재 매치 하나만 바꾸고 다음 매치로 이동 (편집 모드 전용)
function replaceCurrent() {
  if (find.mode !== 'edit') return;
  if (find.index < 0 || !find.matches.length) return;
  const start = find.matches[find.index];
  const qlen = els.findInput.value.length;
  const rep = els.replaceInput.value;
  editText(start, start + qlen, rep);
  els.editor.setSelectionRange(start + rep.length, start + rep.length);   // 다음 매치가 자연스레 선택되도록
  setDirty(true);
  recomputeMatches(false);
  selectCurrent();
}

// 매치 전체를 한 번에 바꿈 (함수형 치환으로 $& 등 특수 치환 문자열 영향 차단, 편집 모드 전용)
function replaceAll() {
  if (find.mode !== 'edit') return;
  const re = findRegex();
  if (!re) return;
  const rep = els.replaceInput.value;
  const before = els.editor.value;
  const count = find.matches.length;
  const after = before.replace(re, () => rep);
  if (after === before) { updateFindCount(); return; }
  editText(0, before.length, after);
  setDirty(true);
  recomputeMatches(false);
  els.findInput.focus();                           // editText가 옮긴 포커스를 찾기창으로 복귀
  els.findCount.textContent = L.replaced(count);   // recompute가 덮어쓴 카운트를 결과로 교체
}

// 바꾸기 행 표시/숨김 + 토글 셰브론 갱신 (▾ 펼침 / ▸ 접힘)
function setReplaceVisible(show) {
  els.findbar.classList.toggle('replace', show);
  els.findToggle.textContent = show ? '▾' : '▸';
}

// 찾기 바 열기. 현재 모드 그대로 검색하고, 바꾸기(replaceMode)는 편집 모드로 전환해서만.
function openFind(replaceMode) {
  let t = activeTab();
  if (!t) return;
  if (replaceMode && !t.editing) { setMode(true); t = activeTab(); }
  find.mode = t.editing ? 'edit' : 'preview';
  els.findbar.hidden = false;
  els.findbar.classList.toggle('preview', find.mode === 'preview');   // 미리보기: 바꾸기 UI 숨김
  setReplaceVisible(!!replaceMode && find.mode === 'edit');
  const sel = find.mode === 'edit'
    ? els.editor.value.substring(els.editor.selectionStart, els.editor.selectionEnd)
    : String(window.getSelection() || '');
  if (sel && !sel.includes('\n')) els.findInput.value = sel;   // 선택 텍스트를 찾기어로 채움
  recomputeMatches(false);
  selectCurrent();
  els.findInput.focus();
  els.findInput.select();
}
function hideFind() {
  if (els.findbar) els.findbar.hidden = true;
  clearFindHighlights();
}
function closeFind() {
  hideFind();
  const t = activeTab();
  if (t && t.editing) els.editor.focus();
  else els.preview.focus({ preventScroll: true });   // 미리보기 찾기였으면 키 스크롤 유지
}

els.findInput.addEventListener('input', () => { recomputeMatches(false); selectCurrent(); });
els.findInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); goToMatch(e.shiftKey ? -1 : 1); }
  else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
});
els.replaceInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); replaceCurrent(); }
  else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
});
els.findToggle.addEventListener('click', () => {
  const show = !els.findbar.classList.contains('replace');
  setReplaceVisible(show);
  (show ? els.replaceInput : els.findInput).focus();   // 펼치면 바꾸기 입력창으로 포커스
});
els.findPrev.addEventListener('click', () => goToMatch(-1));
els.findNext.addEventListener('click', () => goToMatch(1));
els.findCase.addEventListener('click', () => {
  find.caseSensitive = !find.caseSensitive;
  els.findCase.classList.toggle('active', find.caseSensitive);
  recomputeMatches(false);
  selectCurrent();
});
els.replaceOne.addEventListener('click', replaceCurrent);
els.replaceAll.addEventListener('click', replaceAll);
els.findClose.addEventListener('click', closeFind);

// ---- 커스텀 타이틀바: 상단 바가 OS 제목표시줄 역할 (드래그·더블클릭·창 버튼) ----

// 타이틀바의 빈 영역(바 자체·스페이서·앱 아이콘·타이틀)에서만 창 드래그/더블클릭 동작
function isBarBlank(e) {
  return e.target === els.bar
    || (e.target.classList?.contains('spacer') && e.target.parentElement === els.bar)
    || e.target.id === 'appIcon'
    || e.target.id === 'appTitle';
}
els.bar.addEventListener('mousedown', (e) => {
  if (e.button === 0 && isBarBlank(e) && host) host.postMessage({ cmd: 'windrag' });
});
els.bar.addEventListener('dblclick', (e) => {
  if (isBarBlank(e) && host) host.postMessage({ cmd: 'winmax' });
});
els.minBtn.addEventListener('click', () => { if (host) host.postMessage({ cmd: 'winmin' }); });
els.maxBtn.addEventListener('click', () => { if (host) host.postMessage({ cmd: 'winmax' }); });
els.closeBtn.addEventListener('click', () => { if (host) host.postMessage({ cmd: 'winclose' }); });

function applyWinState(maximized) {
  winMaximized = maximized;
  els.maxBtn.classList.toggle('maximized', maximized);
  setTitle(els.maxBtn, maximized ? L.winRestore : L.winMax);
}

// 창 가장자리 리사이즈: 창 프레임이 없으므로 웹이 5px 가장자리를 감지해 네이티브로 넘김
const RESIZE_EDGE = 5;
const EDGE_CURSORS = {
  n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
  ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize',
};
function edgeAt(x, y) {
  if (winMaximized) return null;
  const w = window.innerWidth, h = window.innerHeight;
  const l = x < RESIZE_EDGE, r = x > w - RESIZE_EDGE, t = y < RESIZE_EDGE, b = y > h - RESIZE_EDGE;
  if (t && l) return 'nw';
  if (t && r) return 'ne';
  if (b && l) return 'sw';
  if (b && r) return 'se';
  if (l) return 'w';
  if (r) return 'e';
  if (t) return 'n';
  if (b) return 's';
  return null;
}
document.addEventListener('mousemove', (e) => {
  const edge = edgeAt(e.clientX, e.clientY);
  document.body.style.cursor = edge ? EDGE_CURSORS[edge] : '';
});
document.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  const edge = edgeAt(e.clientX, e.clientY);
  if (edge && host) {
    e.preventDefault();
    e.stopPropagation();
    host.postMessage({ cmd: 'winresize', edge });
  }
}, true);   // 캡처 단계 — 가장자리에 걸친 다른 요소보다 먼저 처리

// 버튼
let appVersion = '';   // 버전은 🌐 언어 메뉴 하단에 표시 (C#의 app 메시지로 수신)
els.openBtn.addEventListener('click', openFile);
els.toggleBtn.addEventListener('click', toggleMode);
els.saveBtn.addEventListener('click', save);
els.backBtn.addEventListener('click', goBack);
els.fwdBtn.addEventListener('click', goForward);

// ---- 파일 드래그&드롭으로 열기 ----
// 웹 File 객체에는 로컬 경로가 없으므로 WebView2 전용 API로 C#에 실제 경로를 전달
window.addEventListener('dragover', (e) => { e.preventDefault(); });
window.addEventListener('drop', (e) => {
  e.preventDefault();                            // 기본 동작(파일로 내비게이션) 차단
  const files = e.dataTransfer && e.dataTransfer.files;
  if (!host || !files || !files.length) return;
  if (host.postMessageWithAdditionalObjects)
    host.postMessageWithAdditionalObjects({ cmd: 'drop' }, [...files]);
});

// 편집 중에는 미리보기가 숨겨져 있으므로 렌더는 미리보기 전환 시(setMode)에만 수행
els.editor.addEventListener('input', () => {
  setDirty(true);
  if (!els.findbar.hidden) recomputeMatches(true);   // 편집 내용이 바뀌면 매치 갱신
});

// ---- 이미지 클릭 확대 (라이트박스) ----
function openLightbox(src) {
  els.lightboxImg.src = src;
  els.lightbox.hidden = false;
}
function closeLightbox() {
  els.lightbox.hidden = true;
  els.lightboxImg.removeAttribute('src');   // 큰 data URI 메모리 잡아두지 않음
}
els.lightbox.addEventListener('click', closeLightbox);

// ---- 미리보기 · 편집기 우클릭 메뉴 ----
function selectAllPreview() {
  const r = document.createRange();
  r.selectNodeContents(els.preview);
  const g = getSelection();
  g.removeAllRanges();
  g.addRange(r);
}

// 클립보드 텍스트 붙여넣기 (undo 보존) — 읽기 권한은 C#(PermissionRequested)이 자동 허용
async function pasteFromClipboard() {
  const t = activeTab();
  if (!t || !t.editing) return;
  const ta = els.editor;
  ta.focus();
  try {
    const txt = await navigator.clipboard.readText();
    if (!txt) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    editText(s, e, txt);
    ta.setSelectionRange(s + txt.length, s + txt.length);
    setDirty(true);
  } catch (_) {
    toast(L.pasteDenied);
  }
}

els.preview.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const a = e.target.closest('a[href]');
  const img = e.target.closest('img');
  const sel = String(getSelection());
  const items = [];
  if (a) {
    items.push(
      { label: L.ctxOpenLink, act: () => a.click() },        // 기존 링크 클릭 처리(탭/브라우저 분기) 재사용
      { label: L.ctxCopyLink, act: () => copyText(safeDecode(a.getAttribute('href') || '')) },
      'sep',
    );
  }
  if (img) items.push({ label: L.ctxViewImage, act: () => openLightbox(img.src) }, 'sep');
  items.push(
    { label: L.ctxCopy, act: () => document.execCommand('copy'), disabled: !sel },
    { label: L.ctxSelectAll, act: selectAllPreview },
    'sep',
    { label: L.ctxFind, act: () => openFind(false) },
    { label: L.ctxEditMode, act: () => setMode(true) },
  );
  showMenuAtPoint(items, e.clientX, e.clientY);
});

// 서식 기능은 상단 서식 바와 중복이라 메뉴에는 텍스트 편집 동작만 담는다
els.editor.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const ta = els.editor;
  const hasSel = ta.selectionStart !== ta.selectionEnd;
  showMenuAtPoint([
    { label: L.ctxCut, act: () => { ta.focus(); document.execCommand('cut'); }, disabled: !hasSel },
    { label: L.ctxCopy, act: () => { ta.focus(); document.execCommand('copy'); }, disabled: !hasSel },
    { label: L.ctxPaste, act: pasteFromClipboard },
    { label: L.ctxSelectAll, act: () => { ta.focus(); ta.select(); } },
  ], e.clientX, e.clientY);
});

// 미리보기의 링크·이미지 클릭 처리
els.preview.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) {
    const img = e.target.closest('img');
    if (img && img.src) openLightbox(img.src);   // 링크가 아닌 이미지 → 확대
    return;
  }
  const href = a.getAttribute('href') || '';
  e.preventDefault();

  if (href.startsWith('#')) {                       // 같은 문서 내 앵커 → 해당 헤딩으로 스크롤
    scrollToAnchor(safeDecode(href.slice(1)));
    return;
  }
  if (/^(https?:|mailto:|tel:)/i.test(href)) {                    // 외부 링크 → 기본 브라우저/연결 프로그램으로
    if (host) host.postMessage({ cmd: 'openExternal', url: href });
    return;
  }
  // 나머지 로컬 경로(마크다운·HTML·폴더 등)는 C#이 종류를 판별해 연다
  const t = activeTab();
  if (host) host.postMessage({ cmd: 'openLink', href, base: t ? t.path : null });
});

// 단축키
document.addEventListener('keydown', (e) => {
  // 라이트박스가 열려 있으면 Esc로 닫기 (최우선)
  if (e.key === 'Escape' && !els.lightbox.hidden) { e.preventDefault(); closeLightbox(); return; }
  // 업데이트 팝업이 열려 있으면 Esc로 닫기
  if (e.key === 'Escape' && !els.updOverlay.hidden) { e.preventDefault(); hideUpdatePopup(); return; }
  // 우클릭 메뉴가 열려 있으면 Esc로 닫기
  if (e.key === 'Escape' && !els.ctxmenu.hidden) { e.preventDefault(); hideTabMenu(); return; }
  // 찾기 바가 열려 있으면 Esc로 닫기 (포커스가 에디터 등 어디에 있든)
  if (e.key === 'Escape' && !els.findbar.hidden) { e.preventDefault(); closeFind(); return; }
  // 문서 내비게이션 (Alt+← / Alt+→)
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goBack(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); goForward(); return; }
  }
  const ctrl = e.ctrlKey || e.metaKey;
  if (!ctrl) return;
  const k = e.key.toLowerCase();
  if (k === 's') { e.preventDefault(); save(); }
  else if (k === 'e') { e.preventDefault(); toggleMode(); }
  else if (k === 'o') { e.preventDefault(); openFile(); }
  else if (k === 'n') { e.preventDefault(); newDoc(); }
  else if (k === 'w') { e.preventDefault(); if (activeId !== null) closeTab(activeId); }
  else if (k === 'f') { e.preventDefault(); openFind(false); }
  else if (k === 'h') { e.preventDefault(); openFind(true); }
  else if (k === 'p') { e.preventDefault(); exportPdf(); }           // 브라우저 인쇄 대신 PDF 내보내기
  else if (k === 'b') { e.preventDefault(); wrapSelection('**'); }   // 굵게
  else if (k === 'i') { e.preventDefault(); wrapSelection('*'); }    // 기울임
  else if (k === 'k') { e.preventDefault(); if (document.activeElement === els.editor) insertLink(); }   // 링크

  else if (k === 'tab') { e.preventDefault(); cycleTab(e.shiftKey ? -1 : 1); }   // 탭 순환
  else if (k === 'pagedown') { e.preventDefault(); cycleTab(1); }
  else if (k === 'pageup') { e.preventDefault(); cycleTab(-1); }
});

// 마우스 뒤로/앞으로 버튼 (4·5번) → 문서 내비게이션
window.addEventListener('mouseup', (e) => {
  if (e.button === 3) { e.preventDefault(); goBack(); }
  else if (e.button === 4) { e.preventDefault(); goForward(); }
});

// ---- 자동 백업 / 크래시 복구 ----
// 저장 안 된(dirty) 탭만 30초마다 localStorage에 스냅샷. 저장·닫기 시 즉시 갱신.
// 시작 시 백업이 남아 있으면(비정상 종료 또는 저장 안 하고 닫음) 복구를 제안한다.
const BACKUP_KEY = 'backup';

function backupNow() {
  try {
    const entries = tabs.filter(t => t.dirty).map(t => ({
      path: t.path,
      name: t.name,
      text: (t.id === activeId && t.editing) ? els.editor.value : t.text,   // 편집 중 최신값
    }));
    if (entries.length) localStorage.setItem(BACKUP_KEY, JSON.stringify(entries));
    else localStorage.removeItem(BACKUP_KEY);
  } catch (_) { /* 용량 초과 등 → 이번 백업만 건너뜀 */ }
}
setInterval(backupNow, 30000);
// 창 최소화·숨김·종료 직전에도 발화 → 30초 주기 사이의 공백을 보완
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') backupNow();
});
window.addEventListener('pagehide', backupNow);   // 창 닫기 직전 마지막 스냅샷 (복구 제안의 최신성 보장)

function offerRestore() {
  let entries = [];
  try { entries = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]'); } catch (_) {}
  if (!Array.isArray(entries) || !entries.length) return;
  if (!window.confirm(L.restoreConfirm(entries.length))) {
    try { localStorage.removeItem(BACKUP_KEY); } catch (_) {}
    return;
  }
  for (const en of entries) {
    const exist = en.path ? tabs.find(x => x.path === en.path) : null;
    if (exist) {                                 // 같은 파일이 이미 열려 있으면 백업 내용으로 교체
      exist.text = en.text || '';
      exist.dirty = true;
      if (exist.id === activeId) {
        els.editor.value = exist.text;
        if (!exist.editing) render();
      }
    } else {
      openOrFocus({ path: en.path || null, name: en.name || L.newDoc, text: en.text || '' });
      const t = activeTab();
      if (t) t.dirty = true;
    }
  }
  renderTabs();
  sendState();
  toast(L.restored);
}

// ---- 클립보드 이미지 붙여넣기 → 문서 옆 images/ 폴더에 저장 + 링크 삽입 ----
els.editor.addEventListener('paste', (e) => {
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  for (const it of items) {
    if (!it.type || !it.type.startsWith('image/')) continue;
    e.preventDefault();
    const t = activeTab();
    if (!t) return;
    if (!t.path) { toast(L.saveFirst); return; }
    const file = it.getAsFile();
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      const data = String(fr.result).split(',')[1] || '';
      if (data && host) host.postMessage({ cmd: 'pasteImage', id: t.id, base: t.path, type: it.type, data });
    };
    fr.readAsDataURL(file);
    return;                                      // 이미지 하나만 처리
  }
});

// C#이 저장을 마친 이미지를 문서에 반영 (커서 위치에 마크다운 링크 삽입)
function insertPastedImage(m) {
  const t = tabs.find(x => x.id === m.id);
  if (!t) return;
  t.img = Object.assign({}, t.img, { [m.src]: m.dataUri });   // 미리보기 매핑 즉시 등록
  const md = `![](${m.src})`;
  if (t.id === activeId && t.editing) {
    const s = els.editor.selectionStart, en = els.editor.selectionEnd;
    editText(s, en, md);
    els.editor.setSelectionRange(s + md.length, s + md.length);
    t.text = els.editor.value;
  } else {                                       // 드물게 응답 전 탭을 떠난 경우 → 끝에 추가
    t.text += (!t.text || t.text.endsWith('\n') ? '' : '\n') + md;
    if (t.id === activeId && !t.editing) render();
  }
  if (!t.dirty) { t.dirty = true; renderTabs(); sendState(); }
  toast(L.imgSaved(m.src));
}

// ---- 외부 변경 자동 반영 ----
// 열린 문서가 다른 프로그램에서 저장되면 C#이 fileChanged로 새 내용을 보내온다.
// 미저장 편집이 없으면 조용히 반영(+토스트), 있으면 덮어쓸지 확인한다.
function applyExternalChange(m) {
  const t = tabs.find(x => x.path === m.path);
  if (!t) return;
  const newText = m.text || '';
  const curText = (t.id === activeId && t.editing) ? els.editor.value : t.text;
  if (curText === newText) { t.img = m.imgMap || null; return; }   // 내용 동일(우리 저장 등) → 무시
  if (t.dirty) {
    // 같은 외부 내용에 대해 이미 "내 편집 유지"를 선택했다면 같은 확인을 반복하지 않음
    // (파일 이벤트는 인덱서·백신 등으로 같은 내용에 여러 번 올 수 있다)
    if (t.extDeclined === newText) return;
    if (!window.confirm(L.extConfirm(t.name))) { t.extDeclined = newText; return; }
  }
  t.extDeclined = undefined;

  t.text = newText;
  t.img = m.imgMap || null;
  t.dirty = false;
  if (t.id === activeId) {
    if (t.editing) {                       // 편집 중이던 위치는 최대한 유지
      const caret = Math.min(els.editor.selectionStart, newText.length);
      const scroll = els.editor.scrollTop;
      els.editor.value = newText;
      els.editor.setSelectionRange(caret, caret);
      els.editor.scrollTop = scroll;
      t.caret = t.selEnd = caret;
      t.editScroll = scroll;
    } else {
      saveScroll();
      render();
      els.preview.scrollTop = t.scroll;    // 읽던 위치 유지
    }
  }
  toast(L.extApplied(t.name));
  backupNow();                             // dirty 해제된 상태를 백업에도 반영
  renderTabs();
  sendState();
}

// 탭 키 들여쓰기: 한 줄이면 캐럿에 2칸, 여러 줄 선택이면 줄 단위 들여쓰기.
// Shift+Tab은 줄 앞의 공백(최대 2칸)·탭 문자를 제거하는 내어쓰기.
els.editor.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  if (e.ctrlKey) return;                 // Ctrl+Tab은 탭 전환 (document 핸들러가 처리)
  e.preventDefault();
  const ta = els.editor, v = ta.value;
  const s = ta.selectionStart, en = ta.selectionEnd;
  const multi = v.slice(s, en).includes('\n');

  if (!multi && !e.shiftKey) {
    editText(s, en, '  ');
    ta.setSelectionRange(s + 2, s + 2);
  } else {
    // 선택(또는 캐럿)이 걸친 줄들의 전체 범위 [ls, le)
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    let le = en > s && v[en - 1] === '\n' ? en - 1 : en;   // 줄 시작에서 끝난 선택은 그 줄 제외
    le = v.indexOf('\n', le);
    if (le === -1) le = v.length;
    const lines = v.slice(ls, le).split('\n');
    let dS = 0, dTotal = 0, out;
    if (e.shiftKey) {
      out = lines.map((ln, i) => {
        const cut = (ln.match(/^( {1,2}|\t)/) || [''])[0].length;
        if (i === 0) dS = -cut;
        dTotal -= cut;
        return ln.slice(cut);
      }).join('\n');
    } else {
      out = lines.map((ln) => '  ' + ln).join('\n');
      dS = 2;
      dTotal = 2 * lines.length;
    }
    if (out !== v.slice(ls, le)) {
      editText(ls, le, out);
      ta.setSelectionRange(Math.max(ls, s + dS), Math.max(ls, en + dTotal));
    }
  }
  setDirty(true);
  if (!els.findbar.hidden) recomputeMatches(true);
});

// C# → JS 메시지 수신
if (host) {
  host.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || !m.cmd) return;
    if (m.cmd === 'load') {
      openOrFocus({ path: m.path || null, name: m.name || L.newDoc, text: m.text || '', img: m.imgMap || null });
      if (m.startupBlank) restoreSession();    // 파일 없이 실행됨 → 이전 세션 탭 복원
      if (m.anchor) {                          // 문서 간 #섹션 링크 → 미리보기로 전환해 해당 헤딩으로
        const t = activeTab();
        if (t && t.editing) setMode(false);
        const a = safeDecode(m.anchor);
        scrollToAnchor(a);
        // 다이어그램이 완성되면 위쪽 레이아웃이 늘어나 목표 위치가 밀림 → 렌더 완료 후 한 번 보정
        if (els.preview.querySelector('.mermaid')) mermaidRun.then(() => scrollToAnchor(a));
      }
    } else if (m.cmd === 'saved') {
      const t = tabs.find(x => x.id === m.id);
      if (!t) return;
      t.path = m.path || t.path;
      t.name = m.name || t.name;
      t.dirty = false;
      t.img = m.imgMap || null;               // 저장 시점 기준 이미지 맵 (편집 중 추가분 반영)
      backupNow();                            // 저장된 탭은 백업에서 즉시 제거
      renderTabs();
      if (t.id === activeId) {
        sendState();                          // 창 제목 갱신
        if (!t.editing) {                     // 미리보기 중 저장이면 새 이미지 맵으로 즉시 재렌더
          saveScroll();
          render();
          els.preview.scrollTop = t.scroll;
        }
      }
    } else if (m.cmd === 'imageSaved') {
      insertPastedImage(m);
    } else if (m.cmd === 'fileChanged') {
      applyExternalChange(m);              // 외부 프로그램이 저장한 문서 → 자동 반영
    } else if (m.cmd === 'printTheme') {
      applyPrintTheme(m.mode === 'light');        // PDF 직전 라이트 스왑 / 직후 복원
    } else if (m.cmd === 'toast') {
      toast(m.text || '');
    } else if (m.cmd === 'app') {
      // C#이 확정한 언어(설정 > MDE_LANG > OS)와 버전 — 브라우저 추정과 다르면 재적용
      if (m.langMode) langMode = m.langMode;
      if (m.lang) applyLocale(m.lang);
      if (m.version) {
        appVersion = m.version;
        els.appTitle.title = `MarkDownEditor v${appVersion}`;
        els.appVer.textContent = 'v' + appVersion;   // 타이틀 오른쪽 버전 표시
      }
    } else if (m.cmd === 'winstate') {
      applyWinState(!!m.maximized);
    } else if (m.cmd === 'pathMissing') {
      // 최근 문서/세션의 파일이 삭제·이동됨 → 목록에서 제거 (세션 복원 중이면 조용히)
      dropRecent(m.path || '');
      if (!m.quiet) toast(L.fileMissing((m.path || '').split(/[\\/]/).pop()));
    } else if (m.cmd === 'updateStatus') {
      // 확인 결과 (latest/notes는 새 버전이 있을 때만 값이 옴)
      upd.status = m.status || 'idle';
      upd.reason = m.reason || '';
      upd.latest = m.latest || null;
      upd.notes = m.notes || '';
      renderUpdate();
    } else if (m.cmd === 'updateProgress') {
      upd.pct = typeof m.percent === 'number' ? m.percent : -1;
      upd.status = m.phase === 'download' ? 'downloading'
        : m.phase === 'extract' ? 'extracting' : 'restarting';
      renderUpdate();
    }
  });

  // 웹 준비 완료 → C#이 첫 문서(들)를 load로 보냄
  host.postMessage({ cmd: 'ready' });
  // 시작 문서 로드가 끝난 뒤 백업 복구 제안 (load 메시지들이 도착할 시간을 줌)
  setTimeout(offerRestore, 800);
}
