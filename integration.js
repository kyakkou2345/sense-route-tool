// Reuses the existing application screens, route operations, presets and data dialog.
(() => {
  const SENSE_KEY = 'last-turn-route-tool:v1', ANOMALY_KEY = 'anomaly-route-tool:integrated:v1', FUSION_KEY = 'anomaly-sense-route-tool:v1';
  const AVAILABLE_PLANS = new Set(['sense']);
  let plan = 'sense';
  const isAnomaly = () => plan !== 'sense';
  const isFusion = () => plan === 'fusion';
  const senseEffectTypes = [...EFFECT_TYPES];
  const original = {};
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const style = el('style');
  style.textContent = '[hidden]{display:none!important}.plan-selector{display:flex;align-items:center;gap:6px;white-space:nowrap}.plan-selector select{width:115px}.app-header{flex-wrap:wrap}.anomaly-settings{grid-column:1/-1}.anomaly-detail{overflow-x:auto}.anomaly-detail table{min-width:600px}.anomaly-card-fields{max-width:800px}.anomaly-help{margin-top:8px}';
  document.head.append(style);
  const modeLabel = el('label', 'プラン', 'plan-selector');
  const mode = el('select'); mode.id = 'plan-mode'; mode.setAttribute('aria-label', '計算プラン');
  mode.append(option('sense', 'センス')); mode.disabled = true;
  modeLabel.hidden = true; modeLabel.append(mode);
  document.querySelector('.app-header > .button-row').prepend(modeLabel);
  const sceneFields = el('div', undefined, 'fields anomaly-settings');
  sceneFields.id = 'anomaly-scene-fields';
  $('initial-concentration').closest('.fields').prepend(sceneFields);
  const senseFields = [$('initial-concentration').parentElement, $('initial-good').parentElement, document.querySelector('.buff-inputs'), $('super-good').parentElement];
  const passivePanel = $('external-order').closest('section');
  const passive = el('div', undefined, 'stack'); passive.id = 'anomaly-passive';
  passivePanel.append(passive);
  function sceneVisibility() {
    mode.value = plan;
    document.querySelector('h1').textContent = isFusion() ? 'アノ×センス計算ツール' : isAnomaly() ? 'アノマリー計算ツール' : 'センス計算ツール';
    senseFields.forEach(n => n.hidden = isAnomaly());
    if (isFusion()) [$('initial-concentration'), $('initial-good'), $('super-good')].forEach(n => n.parentElement.hidden = false);
    EFFECT_TYPES.splice(0, EFFECT_TYPES.length, ...senseEffectTypes, ...(isAnomaly() ? FusionEngine.TYPES : []));
    sceneFields.hidden = !isAnomaly();
    passivePanel.hidden = isAnomaly();
    passivePanel.parentElement.style.gridTemplateColumns = isAnomaly() ? 'minmax(0, 1fr)' : '';
    for (const child of passivePanel.children) child.hidden = child === passive ? !isAnomaly() : isAnomaly();
    $('remaining-turns').disabled = false;
  }
  function numeric(label, value, update, integer = false) {
    const wrap = el('label', label), input = el('input'); input.type = 'number'; input.min = 0; input.step = integer ? 1 : 'any'; input.value = value;
    input.onchange = () => { if (input.value === '' || !input.checkValidity()) { input.reportValidity(); return; } update(Number(input.value)); recalculateAndSave(true); };
    wrap.append(input); return wrap;
  }
  function dropdown(label, items, value, update) {
    const wrap = el('label', label), select = el('select'); select.setAttribute('aria-label', label); for (const [id, text] of items) select.append(option(id, text, id === value));
    select.onchange = () => { update(select.value); recalculateAndSave(true); }; wrap.append(select); return wrap;
  }
  const anomalyDefaults = () => ({ turn: 11, stance: 'strong1', enthusiasm: 0, add: 0, increase: 0, topQualityActive: true, chantGrowth: 0, initialIdolTargets: [], swayingThoughts: false });
  function addSweetHeart(cards) {
    const existing = cards.find(c => c.id === 'anomaly-sweet-heart' || c.name === '甘く溶ける心');
    if (existing) { existing.kind = 'active'; return; }
    const normal = makeEffect({ type: 'sweetReturn1', value: 3 });
    const plus = makeEffect({ type: 'sweetReturn2', value: 3, count: 0 });
    const card = ensureVariants({ id: 'anomaly-sweet-heart', name: '甘く溶ける心', kind: 'active', effectSchema: 1,
      preEffects: [], effects: [makeEffect({ type: 'strong', value: 1 }), normal, plus], reservedEffects: [] });
    card.variants.plus = [{ effectId: normal.id, field: 'count', mode: 'set', value: 0 }, { effectId: plus.id, field: 'count', mode: 'set', value: 1 }];
    cards.push(card);
  }
  function renderInitialIdolTargets() {
    const box = $('initial-idol-targets');
    if (!box || !isAnomaly()) return;
    box.replaceChildren(el('h3', 'アイドルになります：開始前の対象（上昇回数＋1）'));
    const selected = state.scenario.anomaly.initialIdolTargets || [];
    for (const card of state.cards.filter(c => c.kind === 'active')) {
      const label = el('label', undefined, 'check'), check = el('input');
      check.type = 'checkbox'; check.checked = selected.includes(card.id);
      check.onchange = () => {
        const a = state.scenario.anomaly;
        const targets = a.initialIdolTargets || [];
        a.initialIdolTargets = check.checked ? [...new Set([...targets, card.id])] : targets.filter(id => id !== card.id);
        recalculateAndSave();
      };
      label.append(check, document.createTextNode(card.name)); box.append(label);
    }
  }
  function addFusionSpotlight(cards) {
    if (!isFusion() || cards.some(c => c.id === 'route-card:スポットライト' || c.name === 'スポットライト')) return;
    let source;
    try {
      const saved = JSON.parse(localStorage.getItem(SENSE_KEY) || 'null');
      source = (saved?.cards || saved?.cardLibrary || []).find(c => c.id === 'route-card:スポットライト' || c.name === 'スポットライト');
    } catch {}
    source ??= RouteCardModel.makeCatalog().find(c => c.name === 'スポットライト');
    const card = ensureVariants(normalizeCards([structuredClone(source)])[0]);
    card.id = 'route-card:スポットライト'; card.effectSchema = 1;
    cards.push(card);
  }
  original.normalizeScenario = normalizeScenario;
  normalizeScenario = function(raw = {}) { const s = original.normalizeScenario(raw); if (raw.anomaly) s.anomaly = { ...anomalyDefaults(), ...raw.anomaly }; return s; };
  original.makeDefaultState = makeDefaultState;
  makeDefaultState = function() {
    if (!isAnomaly()) return original.makeDefaultState();
    const s = original.makeDefaultState();
    s.cards = Anomaly.CATALOG.map((c, i) => FusionEngine.convert({ ...Anomaly.makeInstance(c.type, `anomaly-${i}`), preEffects: [], effects: [], reservedEffects: [] }));
    addSweetHeart(s.cards);
    if (isFusion()) {
      const chant = RouteCardModel.makeCatalog().find(c => c.name === 'シュプ'); chant.name = 'シュプレヒコール'; chant.effectSchema = 1; s.cards.push(chant);
      s.cards.push(ensureVariants({ id: 'fusion-national', name: '国民的アイドル', kind: 'mental', effectSchema: 1, preEffects: [], effects: [], reservedEffects: [] }));
      addFusionSpotlight(s.cards);
    }
    s.scenario = { ...defaultScenario(), remainingTurns: 2, paramBoost: 0, anomaly: anomalyDefaults() };
    const route = makeRoute('ルート1', 2); s.routes = [route];
    s.selectedCardId = s.cards[0].id; s.selectedRouteId = s.selectedResultRouteId = route.id; return s;
  };
  original.collectSaveData = collectSaveData;
  collectSaveData = function() { return { ...original.collectSaveData(), plan }; };
  original.migrateSavedData = migrateSavedData;
  migrateSavedData = function(raw) {
    if (!AVAILABLE_PLANS.has(raw.plan ?? 'sense')) throw new Error('このプランは未実装です');
    if (!isAnomaly()) { if (raw.plan === 'anomaly' || raw.plan === 'fusion') throw new Error('先にアノマリーへ切り替えてください'); return original.migrateSavedData(raw); }
    if (raw.plan !== plan) throw new Error('アノマリー用の保存データを指定してください');
    if (!Array.isArray(raw.cards) || !Array.isArray(raw.routes)) throw new Error('カードまたはルートの形式が不正です');
    const s = makeDefaultState();
    s.cards = raw.cards.map(c => {
      if (!c.id || !['active', 'mental', 'drink'].includes(c.kind)) throw new Error('カード定義が不正です');
      return FusionEngine.convert(normalizeCards([c])[0]);
    });
    if (new Set(s.cards.map(c => c.id)).size !== s.cards.length) throw new Error('カードIDが重複しています');
    addFusionSpotlight(s.cards);
    addSweetHeart(s.cards);
    s.scenario = normalizeScenario({ ...raw.scenario, anomaly: { ...anomalyDefaults(), ...raw.scenario?.anomaly } });
    s.scenePresets = normalizeScenePresets(raw.scenePresets);
    s.routes = structuredClone(raw.routes);
    for (const route of s.routes) {
      if (!Array.isArray(route.turns) || route.turns.length !== s.scenario.remainingTurns) throw new Error('ルートのターン数が局面設定と一致しません');
      for (const turn of route.turns) {
        if (!ATTRIBUTES.includes(turn.attribute) || !Array.isArray(turn.cardIds) || turn.cardIds.some(id => !s.cards.some(c => c.id === id))) throw new Error('ルートのカードまたは属性が不正です');
        turn.upgraded ??= []; turn.configs ??= [];
        for (const cfg of turn.configs) if (cfg?.targets && (!Array.isArray(cfg.targets) || cfg.targets.some(id => !s.cards.some(c => c.id === id && c.kind === 'active')))) throw new Error('成長対象が不正です');
      }
    }
    Object.assign(s, raw.ui || {}); s.activeStep = clampInt(s.activeStep, 0, 3, 0);
    if (!s.cards.some(c => c.id === s.selectedCardId)) s.selectedCardId = s.cards[0]?.id;
    return s;
  };
  original.applyScenarioToInputs = applyScenarioToInputs;
  applyScenarioToInputs = function() {
    original.applyScenarioToInputs(); sceneVisibility(); sceneFields.replaceChildren();
    if (!isAnomaly()) return;
    const a = state.scenario.anomaly ??= anomalyDefaults();
    for (const [key, label] of [['turn', '開始ターン'], ['enthusiasm', '現在熱意'], ['add', '熱意追加'], ['increase', '熱意増加％']]) sceneFields.append(numeric(label, a[key], v => state.scenario.anomaly[key] = v, key === 'turn'));
    sceneFields.append(dropdown('開始指針', Object.entries(Anomaly.STANCES), a.stance, v => state.scenario.anomaly.stance = v));
    const topQualityLabel = el('label', undefined, 'check'), topQualityCheck = el('input');
    topQualityCheck.type = 'checkbox'; topQualityCheck.checked = a.topQualityActive !== false;
    topQualityCheck.onchange = () => { state.scenario.anomaly.topQualityActive = topQualityCheck.checked; recalculateAndSave(true); };
    topQualityLabel.append(topQualityCheck, document.createTextNode('トップクオリティ'));
    sceneFields.append(topQualityLabel);
    const itemLabel = el('label', undefined, 'check'), itemCheck = el('input');
    itemCheck.type = 'checkbox'; itemCheck.checked = !!a.swayingThoughts;
    itemCheck.onchange = () => { state.scenario.anomaly.swayingThoughts = itemCheck.checked; recalculateAndSave(true); };
    itemLabel.append(itemCheck, document.createTextNode('揺れ動く想い')); sceneFields.append(itemLabel);
    if (isFusion()) sceneFields.append(numeric('シュプレヒコールの成長量', a.chantGrowth ?? 0, v => state.scenario.anomaly.chantGrowth = v));
    const initialIdol = el('div', undefined, 'fields anomaly-settings'); initialIdol.id = 'initial-idol-targets';
    sceneFields.append(initialIdol); renderInitialIdolTargets();
  };
  original.renderExternalOrder = renderExternalOrder;
  renderExternalOrder = function() { if (!isAnomaly()) original.renderExternalOrder(); sceneVisibility(); };
  original.renderCarryInCards = renderCarryInCards;
  renderCarryInCards = function() { if (!isAnomaly()) original.renderCarryInCards(); else renderInitialIdolTargets(); };
  original.showStep = showStep;
  showStep = function(index) { original.showStep(index); if (state.activeStep === 1) renderInitialIdolTargets(); };
  original.renderTurnGrid = renderTurnGrid;
  let displayedRouteId = null;
  renderTurnGrid = function(route) {
    const grid = $('turn-grid');
    const sameRoute = displayedRouteId === route.id;
    const position = { top: grid.scrollTop, left: grid.scrollLeft };
    const columns = [...grid.querySelectorAll('.turn-cards')].map(node => ({ top: node.scrollTop, left: node.scrollLeft }));
    original.renderTurnGrid(route);
    displayedRouteId = route.id;
    if (sameRoute) {
      grid.scrollTop = position.top;
      grid.scrollLeft = position.left;
      grid.querySelectorAll('.turn-cards').forEach((node, i) => {
        if (!columns[i]) return;
        node.scrollTop = columns[i].top;
        node.scrollLeft = columns[i].left;
      });
    }
    if (!isAnomaly()) return;
    document.querySelectorAll('#turn-grid .turn-column').forEach((column, i) => {
      column.querySelector('.turn-head strong').textContent = `${state.scenario.anomaly.turn + i}ターン目`;
      column.querySelectorAll('.card-step-name').forEach((name, j) => { name.textContent = resolveCard(getCard(route.turns[i].cardIds[j]), slotConfig(route.turns[i], j))?.name || '削除済みカード'; });
    });
  };
  original.renderRouteCardDialog = renderRouteCardDialog;
  renderRouteCardDialog = function() {
    if (!isAnomaly()) return original.renderRouteCardDialog();
    if (!routeEditTarget) return;
    const { turn, index } = routeEditTarget, card = getCard(turn.cardIds[index]), cfg = slotConfig(turn, index), container = $('route-card-content');
    $('route-card-title').textContent = `${card.name} の設定`; container.replaceChildren();
    container.append(RouteCardEditor.renderConfiguration(card, cfg, () => { renderRouteCardDialog(); renderRoutes(); recalculateAndSave(); }, renderEffectGroup, EFFECT_TYPES));
    const resolved = resolveCard(card, cfg);
    if ([...resolved.preEffects, ...resolved.effects].some(e => e.type === 'growHits' && e.count !== 0)) {
      container.append(el('h3', '対象カード'));
      for (const target of state.cards.filter(c => c.kind === 'active')) {
        const label = el('label', undefined, 'check'), check = el('input'); check.type = 'checkbox'; check.checked = (cfg.targets || []).includes(target.id);
        check.onchange = () => { cfg.targets = check.checked ? [...(cfg.targets || []), target.id] : cfg.targets.filter(id => id !== target.id); recalculateAndSave(); };
        label.append(check, document.createTextNode(target.name)); container.append(label);
      }
    }
  };
  original.simulateRoute = simulateRoute;
  simulateRoute = function(route) {
    if (!isAnomaly()) return original.simulateRoute(route);
    const a = state.scenario.anomaly;
    const calculated = FusionEngine.calculate(state.scenario, state.cards, route, isFusion());
    return { routeId: route.id, name: route.name, totalScore: calculated.final.score, finalState: calculated.final, turns: route.turns.map((turn, i) => ({ attribute: turn.attribute, score: calculated.totals[i], rows: calculated.rows.filter(r => r.turn === a.turn + i), turn: a.turn + i })), warnings: calculated.warnings };
  };
  original.renderRanking = renderRanking;
  renderRanking = function() {
    if (!isAnomaly()) return original.renderRanking();
    const table = el('table'), head = el('tr');
    ['順位', 'ルート', ...Array.from({ length: state.scenario.remainingTurns }, (_, i) => `${state.scenario.anomaly.turn + i}T`), '合計', '最終熱意'].forEach(t => head.append(el('th', t)));
    const thead = el('thead'); thead.append(head); table.append(thead); const body = el('tbody');
    [...latestResults].sort((a,b) => b.totalScore - a.totalScore).forEach((r,i) => {
      const row = el('tr', undefined, `selectable${r.routeId === state.selectedResultRouteId ? ' selected' : ''}`);
      [i+1, r.name, ...r.turns.map(t => fmt(t.score, 3)), fmt(displayedTotal(r), 3), fmt(r.finalState.enthusiasm, 3)].forEach(v => row.append(el('td', v)));
      row.onclick = () => { state.selectedResultRouteId = r.routeId; renderResults(); queueSave(); }; body.append(row);
    }); table.append(body); $('ranking').replaceChildren(table);
  };
  original.renderResultDetail = renderResultDetail;
  renderResultDetail = function() {
    if (!isAnomaly()) return original.renderResultDetail();
    const r = latestResults.find(r => r.routeId === state.selectedResultRouteId) || latestResults[0];
    $('result-summary').replaceChildren(); $('result-detail').replaceChildren(); if (!r) return;
    $('result-title').textContent = `${r.name} の詳細`;
    $('result-summary').append(metric('合計スコア', fmt(displayedTotal(r), 3)), metric('最終熱意', fmt(r.finalState.enthusiasm, 3)), metric('熱意追加', fmt(r.finalState.add, 3)), metric('熱意増加', `${fmt(r.finalState.increase, 3)}%`));
    if (isFusion()) $('result-summary').append(metric('最終集中', fmt(r.finalState.concentration, 3)), metric('最終好調', fmt(r.finalState.good, 3)));
    r.warnings.forEach(w => $('result-detail').append(el('p', w, 'error')));
    for (const turn of r.turns) {
      const box = el('details', undefined, 'turn-result'); box.open = true;
      box.append(el('summary', `${turn.turn}ターン・${ATTRIBUTE_LABELS[turn.attribute]}　${fmt(turn.score, 3)}`));
      const body = el('div', undefined, 'turn-result-body stack anomaly-detail');
      for (const row of turn.rows) {
        const item = el('div', undefined, 'note');
        item.append(el('strong', row.boundary ? `ターン開始：熱意0${row.nextReserve ? '／予約：温存に変更' : ''}` : `${row.name}　＋${fmt(row.delta, 3)}（${row.count}回）`));
        item.append(el('p', `${Anomaly.STANCES[row.before]} → ${Anomaly.STANCES[row.stance]} ／ 熱意 ${fmt(row.enthusiasm, 3)} ／ 熱意追加 ${fmt(row.add, 3)} ／ 熱意増加 ${fmt(row.increase, 3)}%`, 'muted'));
        if (isFusion()) item.append(el('p', `集中 ${fmt(row.concentration, 3)} ／ 好調 ${fmt(row.good, 3)}`, 'muted'));
        if (state.logDetail && (row.itemTriggered || row.sweetTriggered)) item.append(el('p', [row.itemTriggered ? '揺れ動く想い' : '', row.sweetTriggered ? `甘く溶ける心（残り${row.sweetRemaining}回）` : ''].filter(Boolean).join(' ／ '), 'muted'));
        if (state.logDetail && row.attacks?.length) item.append(el('p', row.attacks.map(a => `基礎 ${fmt(a.base, 3)}＋集中 ${fmt(a.concentration, 3)}＋熱意 ${fmt(a.enthusiasm, 3)} → ${fmt(a.hit, 3)} × ${a.count}回`).join(' / '), 'muted'));
        if (state.logDetail && !row.boundary) item.append(el('p', `獲得熱意 ${fmt(row.gain, 3)}（解除計算時：追加 ${fmt(row.usedAdd, 3)}、増加 ${fmt(row.usedIncrease, 3)}%）／1ヒット ${fmt(row.perHit, 3)}／使用後TQ：追加＋${row.topAdd}、増加＋${row.topIncrease}%${row.targets.length ? '／上昇回数＋1：' + row.targets.map(id => getCard(id)?.name).join('、') : ''}`, 'muted'));
        body.append(item);
      }
      box.append(body); $('result-detail').append(box);
    }
  };
  original.renderAll = renderAll;
  renderAll = function() { sceneVisibility(); original.renderAll(); };
  function migrateStandalone() {
    const raw = localStorage.getItem('anomaly-route-tool:v1');
    if (!raw) return makeDefaultState();
    const old = JSON.parse(raw);
    if (!old.inputs || !Array.isArray(old.cards) || !Array.isArray(old.routes) || old.routes.length !== 2) throw new Error('旧アノマリーデータの形式が不正です');
    const s = makeDefaultState();
    s.cards = old.cards.map(c => FusionEngine.convert({ ...c, preEffects: [], effects: [], reservedEffects: [] }));
    s.scenario.anomaly = { turn: old.inputs.turn, stance: old.inputs.stance, enthusiasm: old.inputs.enthusiasm, add: old.inputs.add, increase: old.inputs.increase };
    s.scenario.paramBoost = old.inputs.paramBoost;
    s.scenario.multipliers = { vo: old.inputs.multiplier1 * 100, da: old.inputs.multiplier2 * 100, vi: 4300 };
    s.scenario.memo = old.memo || '';
    s.routes[0].turns = old.routes.map((entries, i) => ({ attribute: i ? 'da' : 'vo', cardIds: entries.map(e => e.cardId), upgraded: entries.map(() => false), configs: entries.map(e => ({ ...blankConfig(), targets: e.targets || [] })) }));
    s.selectedCardId = s.cards[0]?.id;
    return s;
  }
  function switchPlan(next) {
    if (!AVAILABLE_PLANS.has(next)) { mode.value = plan; return; }
    if (next === plan) return;
    saveNow(); clearTimeout(saveTimer);
    const step = state.activeStep;
    plan = next; STORAGE_KEY = isFusion() ? FUSION_KEY : isAnomaly() ? ANOMALY_KEY : SENSE_KEY;
    cardEditorOpen = false; routeEditTarget = null; latestResults = [];
    $('card-search').value = ''; $('card-kind-filter').value = 'all';
    const raw = localStorage.getItem(STORAGE_KEY);
    try { state = raw ? migrateSavedData(JSON.parse(raw)) : plan === 'anomaly' ? migrateStandalone() : makeDefaultState(); }
    catch (error) { state = makeDefaultState(); setSaveStatus(`復元失敗：${error.message}`); }
    state.activeStep = step; applyScenarioToInputs(); renderAll();
    localStorage.setItem('route-tool:selected-plan', plan);
  }
  mode.onchange = () => switchPlan(mode.value);
  if (AVAILABLE_PLANS.has(localStorage.getItem('route-tool:selected-plan')) && localStorage.getItem('route-tool:selected-plan') !== plan) switchPlan(localStorage.getItem('route-tool:selected-plan'));
  else { sceneVisibility(); applyScenarioToInputs(); }
})();
