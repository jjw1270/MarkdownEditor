import { readFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const [webSocketUrl, documentPath, appPath, caseVariantPath] = process.argv.slice(2);
if (!webSocketUrl || !documentPath || !appPath || !caseVariantPath) {
  throw new Error('usage: WebViewBehaviorClient <websocket-url> <document> <app> <case-variant>');
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
await waitFor(
  () => evaluate("typeof tabs !== 'undefined' && tabs.length === 1 && !!document.querySelector('.md-body h1')"),
  'initial document did not render',
);

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

process.stdout.write(JSON.stringify({ rendered, tabCount, saved: '# newest', externalReload: true }));
socket.close();
