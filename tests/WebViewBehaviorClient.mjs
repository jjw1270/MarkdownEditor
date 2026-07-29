import { readFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const [webSocketUrl, documentPath, appPath, caseVariantPath, zoomFile, mode = 'exercise'] = process.argv.slice(2);
if (!webSocketUrl || !documentPath || !appPath || !caseVariantPath || !zoomFile) {
  throw new Error('usage: WebViewBehaviorClient <websocket-url> <document> <app> <case-variant> <zoom-file> [mode]');
}

const socket = new WebSocket(webSocketUrl);
const pending = new Map();
let nextId = 1;

socket.addEventListener('message', (event) => {
  const message = JSON.parse(String(event.data));
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', () => reject(new Error('DevTools WebSocket connection failed')), { once: true });
});

function command(method, params = {}) {
  const id = nextId++;
  const promise = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  socket.send(JSON.stringify({ id, method, params }));
  return promise;
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime.evaluate failed');
  return result.result.value;
}

async function waitFor(check, message, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    last = await check();
    if (last) return last;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${message}; last=${JSON.stringify(last)}`);
}

await command('Runtime.enable');

if (mode === 'verify-zoom') {
  await waitFor(
    () => evaluate("typeof documentZoom !== 'undefined' && documentZoom === 130 && els.zoomPct.textContent === '130%'"),
    'saved document zoom was not restored',
  );
  const restored = await evaluate(`({
    zoom: documentZoom,
    previewFont: parseFloat(getComputedStyle(document.querySelector('.md-body')).fontSize),
    barHeight: els.bar.getBoundingClientRect().height,
  })`);
  await evaluate('setDocumentZoom(100)');
  await waitFor(() => {
    try { return readFileSync(zoomFile, 'utf8').trim() === '1'; } catch { return false; }
  }, 'reset document zoom was not persisted');
  await new Promise((resolve) => process.stdout.write(JSON.stringify({ restored }), resolve));
  socket.close();
  process.exit(0);
}

await waitFor(
  () => evaluate("typeof tabs !== 'undefined' && tabs.length === 1 && !!document.querySelector('.md-body h1')"),
  'initial document did not render',
);

const chromeAndZoom = await evaluate(`(() => {
  setDocumentZoom(100);
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height,
      centerY: r.top + r.height / 2 };
  };
  const initial = {
    bar: rect(els.bar), tabrow: rect(document.getElementById('tabrow')),
    tab: rect(document.querySelector('.tab')), plus: rect(els.newTabBtn),
    back: rect(els.backBtn), previewFont: parseFloat(getComputedStyle(document.querySelector('.md-body')).fontSize),
    dpr: window.devicePixelRatio, innerWidth: window.innerWidth,
  };
  const originalId = activeId;
  const originalCount = tabs.length;
  els.newTabBtn.click();
  const createdOnce = tabs.length === originalCount + 1 && activeId !== originalId;
  closeTab(activeId);

  setMode(true);
  els.editor.focus();
  openLightbox('data:image/gif;base64,R0lGODlhAQABAAAAACw=');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
  const shortcutDialog = {
    opened: !els.shortcutOverlay.hidden,
    lightboxClosed: els.lightbox.hidden,
    rows: els.shortcutList.querySelectorAll('tr').length,
    title: els.shortcutTitle.textContent,
    closeFocused: document.activeElement === els.shortcutClose,
    buttonLabel: els.shortcutsBtn.getAttribute('aria-label'),
    globalPlacement: els.shortcutsBtn.parentElement === els.bar,
  };
  const countWhileModalOpen = tabs.length;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true, cancelable: true }));
  shortcutDialog.backgroundCommandBlocked = tabs.length === countWhileModalOpen && !els.shortcutOverlay.hidden;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
  shortcutDialog.closed = els.shortcutOverlay.hidden;
  shortcutDialog.focusRestored = document.activeElement === els.editor;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  shortcutDialog.escapeClosed = els.shortcutOverlay.hidden && document.activeElement === els.editor;
  els.updOverlay.hidden = false;
  els.updClose.focus();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
  shortcutDialog.updatePopupClosed = els.updOverlay.hidden && !els.shortcutOverlay.hidden;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
  shortcutDialog.transientFocusFallback = els.shortcutOverlay.hidden && document.activeElement === els.shortcutsBtn;
  setMode(false);

  els.preview.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true }));
  const afterPreviewZoom = {
    zoom: documentZoom, label: els.zoomPct.textContent,
    bar: rect(els.bar), tabrow: rect(document.getElementById('tabrow')),
    previewFont: parseFloat(getComputedStyle(document.querySelector('.md-body')).fontSize),
    dpr: window.devicePixelRatio, innerWidth: window.innerWidth,
  };
  els.bar.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true }));
  const toolbarWheelZoom = documentZoom;
  setMode(true);
  const editorFont = parseFloat(getComputedStyle(els.editor).fontSize);
  setMode(false);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '0', ctrlKey: true, bubbles: true, cancelable: true }));
  return {
    initial, afterPreviewZoom, toolbarWheelZoom, editorFont, createdOnce, shortcutDialog,
    resetZoom: documentZoom, resetLabel: els.zoomPct.textContent,
    plusParent: els.newTabBtn.parentElement && els.newTabBtn.parentElement.id,
  };
})()`);

if (chromeAndZoom.plusParent !== 'tabrow') throw new Error(`new button is not fixed in tab row: ${chromeAndZoom.plusParent}`);
if (!chromeAndZoom.createdOnce) throw new Error('new-document button did not create exactly one tab');
if (!chromeAndZoom.shortcutDialog.opened || !chromeAndZoom.shortcutDialog.closed
    || chromeAndZoom.shortcutDialog.rows < 16 || !chromeAndZoom.shortcutDialog.title
    || !chromeAndZoom.shortcutDialog.closeFocused || !chromeAndZoom.shortcutDialog.focusRestored
    || !chromeAndZoom.shortcutDialog.backgroundCommandBlocked || !chromeAndZoom.shortcutDialog.escapeClosed
    || !chromeAndZoom.shortcutDialog.buttonLabel || !chromeAndZoom.shortcutDialog.globalPlacement
    || !chromeAndZoom.shortcutDialog.lightboxClosed || !chromeAndZoom.shortcutDialog.updatePopupClosed
    || !chromeAndZoom.shortcutDialog.transientFocusFallback)
  throw new Error(`keyboard shortcut dialog contract failed: ${JSON.stringify(chromeAndZoom.shortcutDialog)}`);
if (Math.abs(chromeAndZoom.initial.plus.centerY - chromeAndZoom.initial.back.centerY) > 0.75)
  throw new Error(`new button is not vertically centered: ${JSON.stringify(chromeAndZoom.initial)}`);
if (chromeAndZoom.initial.plus.left < chromeAndZoom.initial.tab.right - 1)
  throw new Error(`new button overlaps the active tab: ${JSON.stringify(chromeAndZoom.initial)}`);
if (chromeAndZoom.afterPreviewZoom.zoom !== 110 || chromeAndZoom.afterPreviewZoom.label !== '110%')
  throw new Error(`Ctrl+wheel did not update document zoom: ${JSON.stringify(chromeAndZoom.afterPreviewZoom)}`);
if (chromeAndZoom.afterPreviewZoom.previewFont <= chromeAndZoom.initial.previewFont)
  throw new Error('preview typography did not grow');
if (chromeAndZoom.editorFont <= 13) throw new Error(`editor typography did not share document zoom: ${chromeAndZoom.editorFont}`);
if (chromeAndZoom.afterPreviewZoom.bar.height !== chromeAndZoom.initial.bar.height
    || chromeAndZoom.afterPreviewZoom.tabrow.height !== chromeAndZoom.initial.tabrow.height
    || chromeAndZoom.afterPreviewZoom.dpr !== chromeAndZoom.initial.dpr
    || chromeAndZoom.afterPreviewZoom.innerWidth !== chromeAndZoom.initial.innerWidth)
  throw new Error(`application chrome changed with document zoom: ${JSON.stringify(chromeAndZoom)}`);
if (chromeAndZoom.toolbarWheelZoom !== 110) throw new Error('Ctrl+wheel outside the document changed zoom');
if (chromeAndZoom.resetZoom !== 100 || chromeAndZoom.resetLabel !== '100%')
  throw new Error(`Ctrl+0 did not reset document zoom: ${JSON.stringify(chromeAndZoom)}`);

const rendered = await evaluate(`(() => {
  const h = document.querySelector('.md-body h1');
  const a = document.querySelector('.md-body a');
  return {
    headingId: h && h.id,
    iframeCount: document.querySelectorAll('.md-body iframe').length,
    styleCount: document.querySelectorAll('.md-body style').length,
    formCount: document.querySelectorAll('.md-body form').length,
    eventAttribute: a && a.getAttribute('onclick'),
    styleAttribute: a && a.getAttribute('style'),
    href: a && a.getAttribute('href'),
  };
})()`);

if (rendered.headingId !== '日本語-제목-café') throw new Error(`Unicode heading id mismatch: ${rendered.headingId}`);
if (rendered.iframeCount || rendered.styleCount || rendered.formCount) throw new Error(`active HTML survived sanitizing: ${JSON.stringify(rendered)}`);
if (rendered.eventAttribute || rendered.styleAttribute || rendered.href) throw new Error(`unsafe attributes survived sanitizing: ${JSON.stringify(rendered)}`);

const forwarded = spawn(appPath, [caseVariantPath], { windowsHide: true, stdio: 'ignore' });
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('second instance did not exit')), 10_000);
  forwarded.once('exit', () => { clearTimeout(timer); resolve(); });
  forwarded.once('error', reject);
});
await new Promise((resolve) => setTimeout(resolve, 800));
const tabCount = await evaluate('tabs.length');
if (tabCount !== 1) throw new Error(`case-only path created a duplicate tab: ${tabCount}`);

await evaluate(`(() => {
  setMode(true);
  els.editor.value = '# older';
  els.editor.dispatchEvent(new Event('input', { bubbles: true }));
  save();
  els.editor.value = '# newest';
  els.editor.dispatchEvent(new Event('input', { bubbles: true }));
  save();
  return true;
})()`);

await waitFor(() => {
  let disk;
  try { disk = readFileSync(documentPath, 'utf8'); } catch { return false; }
  return evaluate('!activeTab().dirty').then((clean) => clean && disk === '# newest');
}, 'overlapping saves did not leave the newest text on disk');

writeFileSync(documentPath, '# 외부 변경', 'utf8');
await waitFor(
  () => evaluate("activeTab().text === '# 외부 변경' && els.editor.value === '# 외부 변경'"),
  'external change immediately after save was not applied',
);

await evaluate('setDocumentZoom(130)');
await waitFor(() => {
  try { return readFileSync(zoomFile, 'utf8').trim() === '1.3'; } catch { return false; }
}, 'document zoom was not persisted');

process.stdout.write(JSON.stringify({ rendered, chromeAndZoom, tabCount, saved: '# newest', externalReload: true }));
socket.close();
