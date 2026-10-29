const RouteTools = (() => {
  let past = [], future = [], previous, owner, context;
  const snapshot = () => structuredClone({ routes: state.routes, routeDefaults: state.routeDefaults ?? {}, selectedRouteId: state.selectedRouteId, selectedResultRouteId: state.selectedResultRouteId });
  const key = s => JSON.stringify([s.routes, s.routeDefaults]);
  const boundary = () => JSON.stringify([state.scenario, state.cards]);
  function sync() {
    const next = snapshot(), nextContext = boundary();
    if (owner !== state || context !== nextContext || isRestoring) { past = []; future = []; }
    else if (previous && key(previous) !== key(next)) { past.push(previous); if (past.length > 100) past.shift(); future = []; }
    previous = next; owner = state; context = nextContext;
    update();
  }
  function update() {
    if (!$('route-undo')) return;
    $('route-undo').disabled = !past.length;
    $('route-redo').disabled = !future.length;
    $('routes-clear').disabled = !state.routes.length;
  }
  function travel(back) {
    sync();
    const source = back ? past : future, target = back ? future : past;
    if (!source.length) return;
    target.push(snapshot());
    Object.assign(state, structuredClone(source.pop()));
    previous = snapshot();
    routeEditTarget = null;
    if ($('route-card-dialog').open) $('route-card-dialog').close();
    recalculate(true); queueSave(); update();
  }
  function clear() {
    sync(); state.routes = []; state.selectedRouteId = null; state.selectedResultRouteId = null;
    recalculateAndSave(true);
  }
  function defaults(id) { return { ...blankConfig(), ...(state.routeDefaults?.[id] ?? {}), enhancement: '' }; }
  function apply(id, base, custom) {
    sync();
    state.routeDefaults ??= {};
    state.routeDefaults[id] = { base, custom };
    for (const route of state.routes) for (const turn of route.turns) turn.cardIds.forEach((cardId, i) => {
      if (cardId !== id) return;
      const config = slotConfig(turn, i);
      config.base = base; config.custom = custom;
      delete config.override;
    });
    recalculateAndSave(true);
    setSaveStatus('基本状態・カスタムを全ルートと今後の追加に適用しました');
  }
  function controls(card) {
    const box = document.createElement('section'); box.className = 'definition-bulk-row';
    const base = document.createElement('select'), custom = document.createElement('select');
    base.setAttribute('aria-label', '一括適用する基本状態'); custom.setAttribute('aria-label', '一括適用するカスタム');
    const value = defaults(card.id);
    [['base','未強化'],['plus','＋']].forEach(([id,name]) => base.append(option(id,name,value.base===id)));
    [['','なし'],...card.variants.customs.filter(c=>!c.snapshot).map(c=>[c.id,c.name])].forEach(([id,name])=>custom.append(option(id,name,value.custom===id)));
    box.append(base,custom,button('このカスタムを全ルートに適用','small primary',()=>apply(card.id,base.value,custom.value)));
    return box;
  }
  const save = queueSave;
  queueSave = function() { sync(); return save(); };
  const render = renderRoutes;
  renderRoutes = function() { const result=render(); sync(); return result; };
  const collect = collectSaveData;
  collectSaveData = function() { return {...collect(),routeDefaults:structuredClone(state.routeDefaults ?? {})}; };
  const read = readSavedData;
  readSavedData = function(data) { const result=read(data); result.routeDefaults=structuredClone(data.routeDefaults ?? {}); return result; };
  const editor = renderCardEditor;
  renderCardEditor = function() { editor(); const card=getCard(state.selectedCardId); if(card) $('card-editor').append(controls(card)); };
  const bar = document.createElement('div'); bar.className='route-history-toolbar';
  for (const [id,label,action] of [['route-undo','←',()=>travel(true)],['route-redo','→',()=>travel(false)],['routes-clear','全ルートを削除',clear]]) { const b=button(label,'small',action);b.id=id; const description = id === 'route-undo' ? '1手戻る' : id === 'route-redo' ? '1手進む' : label; b.title=description; b.setAttribute('aria-label',description); bar.append(b); }
  $('route-library').before(bar);
  sync(); renderCardEditor();
  return {sync,travel,clear,apply,defaults};
})();


