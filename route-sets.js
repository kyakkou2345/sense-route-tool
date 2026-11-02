// セット = 局面 + ルート + 参照しているカード定義。未保存変更を確認してから切り替え、元に戻す、共有URL対応。
// app.js は変更せず、既存の局面プリセット欄をこのUIに差し替える。保存先は別キー(route-tool:sets:v1)。
(() => {
  const KEY = 'route-tool:sets:v1', MIGRATED = 'route-tool:sets:migrated';
  const oldBar = document.querySelector('.scene-preset-bar');
  if (!oldBar || typeof state === 'undefined') return;

  const $ = (id) => document.getElementById(id);
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const canon = (v) => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x)
    ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x);

  // ---- 保存 ----
  let store = (() => {
    try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && Array.isArray(d.sets)) return d; } catch {}
    return { sets: [], selectedId: '' };
  })();
  const baseline = {};
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); return true; } catch { toast('保存に失敗しました(ブラウザの容量不足の可能性)'); return false; } };
  const current = () => store.sets.find((s) => s.id === store.selectedId) ?? null;

  function referencedCardIds(scenario, routes) {
    const ids = new Set();
    for (const route of routes ?? []) for (const turn of route.turns ?? []) {
      for (const id of turn.cardIds ?? []) ids.add(id);
    }
    for (const entry of scenario?.carryInCards ?? []) ids.add(entry.cardId);
    return ids;
  }

  function snapshot() {
    readScenarioFromInputs();
    // Save every referenced definition, including customized stock cards and
    // user-created cards. This makes a set reproducible independently of the
    // currently shared card library and future changes to default definitions.
    const ids = referencedCardIds(state.scenario, state.routes);
    const cards = getRouteCards().filter((card) => ids.has(card.id));
    return structuredClone({ scenario: state.scenario, externalOrder: state.externalOrder, routes: state.routes, cards });
  }

  function applyData(d, message) {
    const oldTurns = state.scenario.remainingTurns;
    // Set definitions are private to the working set; never mutate the shared library.
    const ids = referencedCardIds(d.scenario, d.routes);
    const definitions = new Map(normalizeCards(makeDefaultCards()).filter(card => ids.has(card.id)).map(card => [card.id, card]));
    for (const card of (d.cards?.length ? normalizeCards(structuredClone(d.cards)) : [])) definitions.set(card.id, card);
    state.setCards = [...definitions.values()];
    state.scenario = normalizeScenario(structuredClone(d.scenario));
    state.externalOrder = normalizeExternalOrder(d.externalOrder);
    if (Array.isArray(d.routes) && d.routes.length) {
      state.routes = normalizeRoutes(structuredClone(d.routes), getRouteCards(), state.scenario.remainingTurns);
      state.selectedRouteId = state.selectedResultRouteId = state.routes[0].id;
    } else if (oldTurns !== state.scenario.remainingTurns) {
      state.routes.forEach((r) => resizeRouteTurns(r, oldTurns, state.scenario.remainingTurns));
    }
    applyScenarioToInputs();
    renderAll();
    saveNow(message);
  }

  // ---- UI ----
  const style = el('style');
  style.textContent = `.set-bar{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 10px;position:relative}
.set-bar select{flex:1 1 200px;min-width:0}.set-dirty{font-size:12px;padding:2px 8px;border-radius:10px;background:#fde9c8;color:#6b4300;white-space:nowrap}
.set-menu{position:absolute;right:10px;top:100%;z-index:30;display:grid;gap:2px;padding:6px;min-width:190px;background:#fff;color:#1c2630;border:1px solid #b8c4cf;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.18)}
.set-menu button{text-align:left;border:0;background:transparent;color:inherit}.set-menu button:hover{background:#eef3f7}.set-menu .danger{color:#b3261e}
.set-toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:100;display:flex;gap:12px;align-items:center;max-width:92vw;padding:10px 14px;border-radius:8px;background:#26323d;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.3)}
.set-toast button{background:transparent;color:#9fd0ff;border:0;font-weight:700}
#set-dialog{max-width:min(520px,92vw)}#set-dialog textarea,#set-dialog input{width:100%;box-sizing:border-box}#set-dialog textarea{min-height:110px}#set-dialog .button-row{justify-content:flex-end;margin-top:12px}`;
  document.head.append(style);

  const bar = el('section', undefined, 'panel set-bar');
  const select = el('select'); select.setAttribute('aria-label', 'セット');
  const dirty = el('span', 'セットに未保存の変更あり', 'set-dirty'); dirty.hidden = true;
  const saveBtn = el('button', 'このセットを保存', 'primary'); saveBtn.type = 'button';
  const moreBtn = el('button', '⋯'); moreBtn.type = 'button'; moreBtn.setAttribute('aria-label', 'その他の操作'); moreBtn.setAttribute('aria-haspopup', 'menu');
  const menu = el('div', undefined, 'set-menu'); menu.hidden = true; menu.setAttribute('role', 'menu');
  const strong = el('strong', 'セット'); strong.title = '局面とルートをまとめて保存します';
  bar.append(strong, select, dirty, saveBtn, moreBtn, menu);
  oldBar.style.display = 'none';
  oldBar.after(bar);

  const items = [
    ['新規保存', () => openDialog('new')],
    ['名前を変更', () => current() && openDialog('rename')],
    ['共有URLをコピー', shareCurrent],
    ['共有URLから追加', () => openDialog('import')],
    ['削除', deleteCurrent, 'danger'],
  ];
  const menuButtons = items.map(([label, fn, cls]) => { const b = el('button', label, cls); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.onclick = () => { menu.hidden = true; fn(); }; menu.append(b); return b; });
  moreBtn.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; };
  document.addEventListener('click', (e) => { if (!menu.contains(e.target)) menu.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') menu.hidden = true; });

  function renderBar() {
    select.textContent = '';
    select.append(option('', store.sets.length ? 'セットを選択' : '保存済みなし', !store.selectedId));
    for (const s of store.sets) select.append(option(s.id, s.name, s.id === store.selectedId));
    menuButtons[1].disabled = menuButtons[4].disabled = !current();
    saveBtn.textContent = current() ? 'このセットを保存' : '新しいセットとして保存';
    updateDirty();
  }
  function updateDirty() {
    const s = current();
    if (!s || !bar.offsetParent || !s.sig && !baseline[s.id]) { dirty.hidden = true; return; }
    dirty.hidden = canon(snapshot()) === (baseline[s.id] ?? s.sig);
  }
  setInterval(() => { if (!document.hidden) updateDirty(); }, 1000);

  let toastTimer = null;
  function toast(message, undo) {
    document.querySelector('.set-toast')?.remove();
    clearTimeout(toastTimer);
    const t = el('div', undefined, 'set-toast'); t.setAttribute('role', 'status');
    t.append(el('span', message));
    if (undo) { const b = el('button', '元に戻す'); b.type = 'button'; b.onclick = () => { t.remove(); undo(); }; t.append(b); }
    document.body.append(t);
    toastTimer = setTimeout(() => t.remove(), 9000);
  }

  // ---- 操作 ----
  // A single in-app dialog avoids suppressed native confirmations.
  const leaveDialog = el('dialog'); leaveDialog.id = 'set-leave-dialog';
  leaveDialog.setAttribute('aria-labelledby', 'set-leave-title');
  const leaveTitle = el('h2', '未保存の変更があります'); leaveTitle.id = 'set-leave-title';
  const leaveNote = el('p');
  const leaveError = el('p'); leaveError.setAttribute('role', 'alert');
  const leaveRow = el('div', undefined, 'button-row');
  const stay = el('button', 'キャンセル'), discard = el('button', '保存せずに切り替え'), saveLeave = el('button', '保存して切り替え', 'primary');
  for (const button of [stay, discard, saveLeave]) button.type = 'button';
  leaveRow.append(stay, discard, saveLeave);
  leaveDialog.append(leaveTitle, leaveNote, leaveError, leaveRow); document.body.append(leaveDialog);
  let pendingLeave = false;
  async function confirmLeaveCurrent() {
    const s = current();
    if (s && canon(snapshot()) === (baseline[s.id] ?? s.sig ?? canon(s.data))) return true;
    if (pendingLeave) return false;
    pendingLeave = true;
    leaveNote.textContent = s
      ? `セット「${s.name}」の変更を保存しますか？`
      : '保存する場合はセット名を入力してください。';
    const name = el('input'); name.setAttribute('aria-label', '保存するセット名'); name.value = `セット${store.sets.length + 1}`; name.hidden = !!s;
    leaveNote.after(name); leaveError.textContent = '';
    return new Promise(resolve => {
      let accepted = false;
      stay.onclick = () => leaveDialog.close();
      discard.onclick = () => { accepted = true; leaveDialog.close(); };
      saveLeave.onclick = () => {
        if (!s && !name.value.trim()) { leaveError.textContent = 'セット名を入力してください'; return; }
        const oldStore = structuredClone(store), oldBaseline = s && baseline[s.id];
        if (s) writeSet(s);
        else { const added = addSet(name.value.trim(), snapshot()); added.sig = canon(added.data); }
        if (!persist()) {
          store = oldStore;
          if (s && oldBaseline !== undefined) baseline[s.id] = oldBaseline;
          leaveError.textContent = '保存に失敗しました。切り替えを中止しています。'; return;
        }
        accepted = true; leaveDialog.close();
      };
      leaveDialog.addEventListener('close', () => {
        name.remove(); pendingLeave = false; resolve(accepted);
      }, { once: true });
      leaveDialog.showModal(); stay.focus();
    });
  }

  async function loadSet(id) {
    if (id === store.selectedId) return;
    if (!await confirmLeaveCurrent()) { renderBar(); return; }
    const s = store.sets.find((x) => x.id === id);
    const previousId = store.selectedId;
    const before = snapshot();
    store.selectedId = id; persist();
    if (!s) { renderBar(); return; }
    applyData(s.data, `セット「${s.name}」を読み込みました`);
    baseline[s.id] = canon(snapshot());
    renderBar();
    toast(`「${s.name}」を読み込みました`, () => {
      applyData(before, '元に戻しました');
      store.selectedId = previousId; persist(); renderBar();
    });
  }
  function writeSet(s) { s.data = snapshot(); s.sig = canon(s.data); s.updatedAt = Date.now(); delete baseline[s.id]; }
  function saveCurrent() {
    const s = current();
    if (!s) { openDialog('new'); return; }
    const before = structuredClone(s), oldBaseline = baseline[s.id];
    writeSet(s);
    if (!persist()) { Object.assign(s, before); if (oldBaseline !== undefined) baseline[s.id] = oldBaseline; return; }
    renderBar(); toast(`「${s.name}」に保存しました`);
  }
  function addSet(name, data) {
    const s = { id: uuid(), name, data, sig: null, updatedAt: Date.now() };
    store.sets.push(s); store.selectedId = s.id; return s;
  }
  function deleteCurrent() {
    const s = current(); if (!s) return;
    const index = store.sets.indexOf(s);
    store.sets.splice(index, 1); store.selectedId = ''; persist(); renderBar();
    toast(`「${s.name}」を削除しました`, () => { store.sets.splice(index, 0, s); store.selectedId = s.id; persist(); renderBar(); });
  }
  select.onchange = () => loadSet(select.value);
  saveBtn.onclick = saveCurrent;

  // ---- 共有URL ----
  const toB64 = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const fromB64 = (str) => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, (c) => c.charCodeAt(0)); };
  async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
  async function encode(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream === 'undefined') return '0' + toB64(raw);
    return '1' + toB64(await pipe(raw, new CompressionStream('deflate-raw')));
  }
  async function decode(code) {
    const bytes = fromB64(code.slice(1));
    const raw = code[0] === '1' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
    return JSON.parse(new TextDecoder().decode(raw));
  }
  async function shareCurrent() {
    const name = current()?.name ?? '共有セット';
    const url = `${location.origin}${location.pathname}#s=${await encode({ v: 1, n: name, d: snapshot() })}`;
    try { await navigator.clipboard.writeText(url); toast(url.length > 6000 ? '共有URLをコピーしました(長いので、一部のアプリでは途中で切れる可能性があります)' : '共有URLをコピーしました'); }
    catch { openDialog('share', url); }
  }
  async function parseShared(text) {
    const code = (text.includes('#s=') ? text.split('#s=')[1] : text).trim();
    if (!code) throw new Error('URLが空です');
    const obj = await decode(code);
    if (obj?.v !== 1 || typeof obj.n !== 'string' || !obj.d?.scenario) throw new Error('共有データの形式が違います');
    if ((obj.d.routes?.length ?? 0) > 30 || (obj.d.cards?.length ?? 0) > 200) throw new Error('共有データが大きすぎます');
    return obj;
  }
  async function importShared(obj) {
    if (!await confirmLeaveCurrent()) return false;
    const before = snapshot();
    const previousId = store.selectedId;
    const name = store.sets.some((s) => s.name === obj.n) ? `${obj.n} (共有)` : obj.n;
    const s = addSet(name, obj.d);
    persist();
    applyData(s.data, `共有セット「${name}」を追加しました`);
    s.sig = canon(snapshot()); persist(); renderBar();
    toast(`共有セット「${name}」を追加して開きました`, () => {
      applyData(before, '元に戻しました');
      store.sets = store.sets.filter((entry) => entry.id !== s.id);
      store.selectedId = previousId; persist(); renderBar();
    });
    return true;
  }

  // ---- ダイアログ ----
  const dlg = el('dialog'); dlg.id = 'set-dialog';
  const title = el('h2'), input = el('input'), area = el('textarea'), note = el('p'), err = el('p');
  err.style.color = '#b3261e'; input.setAttribute('aria-label', 'セット名');
  const okBtn = el('button', 'OK', 'primary'), cancelBtn = el('button', 'キャンセル');
  okBtn.type = cancelBtn.type = 'button';
  const row = el('div', undefined, 'button-row'); row.append(cancelBtn, okBtn);
  dlg.append(title, input, area, note, err, row); document.body.append(dlg);
  cancelBtn.onclick = () => dlg.close();
  let onOk = null;
  okBtn.onclick = async () => { err.textContent = ''; try { if (await onOk()) dlg.close(); } catch (e) { err.textContent = e.message; } };
  input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); okBtn.click(); } };

  function openDialog(mode, extra) {
    input.hidden = area.hidden = note.hidden = true; err.textContent = ''; okBtn.hidden = false; okBtn.textContent = 'OK';
    if (mode === 'new' || mode === 'rename') {
      title.textContent = mode === 'new' ? '新しいセットとして保存' : '名前を変更';
      input.hidden = false; input.value = mode === 'new' ? `セット${store.sets.length + 1}` : current().name;
      onOk = () => {
        const name = input.value.trim(); if (!name) throw new Error('名前を入力してください');
        const before = structuredClone(store);
        if (mode === 'new') { const s = addSet(name, snapshot()); s.sig = canon(s.data); }
        else current().name = name;
        if (!persist()) { store = before; throw new Error('保存に失敗しました。もう一度お試しください。'); }
        if (mode === 'new') toast(`「${name}」を保存しました`);
        renderBar(); return true;
      };
    } else if (mode === 'import') {
      title.textContent = '共有URLから追加'; area.hidden = false; area.readOnly = false; area.value = ''; area.placeholder = '共有URLを貼り付け';
      okBtn.textContent = '追加して開く';
      onOk = async () => importShared(await parseShared(area.value));
    } else if (mode === 'share') {
      title.textContent = '共有URL'; area.hidden = false; area.readOnly = true; area.value = extra; okBtn.hidden = true; cancelBtn.textContent = '閉じる';
      note.hidden = false; note.textContent = '自動コピーできませんでした。選択してコピーしてください。';
    } else if (mode === 'incoming') {
      title.textContent = `共有セット「${extra.n}」`;
      okBtn.textContent = '追加して開く'; onOk = () => importShared(extra);
    }
    if (mode !== 'share') cancelBtn.textContent = 'キャンセル';
    dlg.showModal();
    if (!input.hidden) { input.focus(); input.select(); } else if (!area.hidden) area.focus();
    if (mode === 'share') area.select();
  }

  // ---- バックアップ(全データJSON)にセットを含める ----
  let exporting = false;
  $('export-json')?.addEventListener('click', () => { exporting = true; setTimeout(() => { exporting = false; }, 0); }, true);
  const baseCollect = collectSaveData;
  collectSaveData = function () {
    const data = baseCollect.apply(this, arguments);
    if (exporting) data.sets = structuredClone(store);
    return data;
  };
  const baseRestore = restoreState;
  restoreState = function (data) {
    const result = baseRestore.apply(this, arguments);
    const incoming = data?.sets?.sets;
    if (Array.isArray(incoming)) {
      const known = new Set(store.sets.map((s) => s.id));
      const fresh = incoming.filter((s) => s?.id && s.name && s.data?.scenario && !known.has(s.id));
      store.sets.push(...fresh);
      if (fresh.length) { persist(); renderBar(); toast(`バックアップからセット${fresh.length}件を追加しました`); }
    }
    return result;
  };

  // ---- 起動時 ----
  if (!localStorage.getItem(MIGRATED)) {
    if (store.sets.length === 0 && state.scenePresets?.length) {
      for (const p of state.scenePresets) store.sets.push({ id: uuid(), name: p.name, sig: null, updatedAt: Date.now(), data: { scenario: structuredClone(p.scenario), externalOrder: [...p.externalOrder], routes: null, cards: [] } });
      persist();
    }
    try { localStorage.setItem(MIGRATED, '1'); } catch {}
  }
  renderBar();
  if (location.hash.startsWith('#s=')) {
    const hash = location.hash;
    history.replaceState(null, '', location.pathname + location.search);
    parseShared(hash).then((obj) => openDialog('incoming', obj)).catch((e) => toast('共有URLを読み込めませんでした: ' + e.message));
  }
})();
