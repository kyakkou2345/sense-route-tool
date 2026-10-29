const RouteCardModel = (() => {
// Card identity is shared; each route entry owns its selected configuration.
const blankConfig = () => ({ base: 'plus', custom: '', enhancement: '' });
const entryId = entry => typeof entry === 'string' ? entry : entry?.cardId;
const effect = (type, value, extra = {}) => ({ id: crypto.randomUUID(), type, value, count: 1, concRate: 1, ...extra });
const patch = (effectId, value, mode = 'set', field = 'value') => ({ effectId, field, mode, value });
function ensureVariants(card) {
  card.reservedEffects ??= [];
  const needsConversion = !card.variants;
  card.variants ??= { plus: [], customs: [], enhancements: [
    { id: 'double', name: '++', patches: [], configured: false },
    { id: 'triple', name: '+++', patches: [], configured: false },
  ] };
  if (needsConversion) {
    for (const effect of [...card.preEffects, ...card.effects, ...card.reservedEffects]) {
      if (!effect.upgradeEnabled) continue;
      for (const field of ['value', 'count', 'concRate', 'goodRate', 'delay', 'repeat', 'interval']) {
        const value = effect['upgrade' + field[0].toUpperCase() + field.slice(1)];
        if (value !== undefined) card.variants.plus.push({ effectId: effect.id, field, mode: 'set', value });
      }
      effect.upgradeEnabled = false;
    }
  }
  return card;
}
function resolveCard(card, entry = {}) {
  if (!card) return null;
  const config = { ...blankConfig(), ...(typeof entry === 'object' ? entry : {}) };
  const result = structuredClone(card);
  const variants = card.variants;
  const custom = variants?.customs.find(v => v.id === config.custom);
  const enhancement = variants?.enhancements.find(v => v.id === config.enhancement);
  const patches = [
    ...(config.base === 'plus' ? variants?.plus ?? [] : []),
    ...(custom?.patches ?? []), ...(enhancement?.patches ?? []),
  ];
  for (const change of patches) {
    const target = [...result.preEffects, ...result.effects, ...(result.reservedEffects ?? [])].find(e => e.id === change.effectId);
    if (!target || !['value', 'count', 'concRate', 'goodRate', 'delay', 'repeat', 'interval', 'duration', 'goodThreshold'].includes(change.field)) continue;
    target[change.field] = change.mode === 'add'
      ? Number(target[change.field] ?? 0) + Number(change.value)
      : Number(change.value);
  }
  if (custom?.snapshot) {
    Object.assign(result, structuredClone(custom.snapshot));
    result.legacySnapshot = true;
    for (const key of ['preEffects', 'effects', 'reservedEffects']) {
      result[key] = (result[key] ?? []).map(effect => {
        if (config.base !== 'plus' || !effect.upgradeEnabled) return effect;
        const copy = { ...effect };
        for (const field of ['value', 'count', 'concRate', 'goodRate', 'delay', 'repeat', 'interval']) {
          const value = effect['upgrade' + field[0].toUpperCase() + field.slice(1)];
          if (value !== undefined) copy[field] = value;
        }
        return copy;
      });
    }
  }
  if (config.override) {
    result.preEffects = structuredClone(config.override.preEffects);
    result.effects = structuredClone(config.override.effects);
    result.reservedEffects = structuredClone(config.override.reservedEffects ?? []);
    result.ljReaction = config.override.ljReaction ?? result.ljReaction;
    result.kind = config.override.kind ?? result.kind;
  }
  const suffix = card.kind === 'drink' ? '' : enhancement?.name ?? (config.base === 'plus' ? '+' : '');
  result.name = `${card.name}${suffix}${custom ? `［${custom.name}］` : ''}${config.override ? '［個別編集］' : ''}`;
  result.unconfigured = !!enhancement && !enhancement.configured;
  return result;
}

function makeCatalog() {
  const make = (name, kind, preEffects, effects, ljReaction = true) => ensureVariants({
    id: `route-card:${name}`, name, kind, preEffects, effects, ljReaction,
  });
  const presence = make('存在感', 'mental', [effect('good', -2)], [effect('concentration', 4)]);
  presence.variants.plus = [patch(presence.preEffects[0].id, -1), patch(presence.effects[0].id, 5)];
  presence.variants.customs = [{ id: 'cost', name: '好調消費0', patches: [patch(presence.preEffects[0].id, 0)] }];
  const chant = make('シュプ', 'active', [effect('concentration', -3)], [effect('score', 6), effect('good', 2)], false);
  chant.variants.plus = [patch(chant.preEffects[0].id, -2), patch(chant.effects[1].id, 3)];
  chant.variants.customs = [{ id: 'cost', name: '集中消費1', patches: [patch(chant.preEffects[0].id, -1)] }];
  chant.variants.enhancements[0] = { id: 'double', name: '++', patches: [patch(chant.effects[0].id, 12)], configured: true };
  const passion = make('情熱ターン', 'active', [], [effect('score', 11), effect('concentration', 3)]);
  passion.variants.plus = [patch(passion.effects[0].id, 18), patch(passion.effects[1].id, 4)];
  passion.variants.customs = [
    { id: 'conc1', name: '集中5', patches: [patch(passion.effects[1].id, 5)] },
    { id: 'conc2', name: '集中7（2カスタム）', patches: [patch(passion.effects[1].id, 7)] },
    { id: 'count', name: 'パラメータ2回', patches: [patch(passion.effects[0].id, 2, 'set', 'count')] },
    { id: 'mixed', name: '集中5・パラメータ2回', patches: [patch(passion.effects[1].id, 5), patch(passion.effects[0].id, 2, 'set', 'count')] },
  ];
  const path = make('道筋', 'mental', [effect('good', -1)], [effect('concentration', 7)]);
  path.variants.plus = [patch(path.effects[0].id, 9)];
  const summer = make('夏夜', 'active', [], [], false);
  const tea = make('センブリ', 'drink', [], [effect('paramBoost', 10)], false);
  const spot = make('スポットライト', 'mental', [], [effect('good', 5), effect('score', 6, { count: 0 })]);
  spot.variants.plus = [patch(spot.effects[0].id, 6)];
  spot.variants.customs = [
    { id: 'good1', name: '好調7（1カスタム）', patches: [patch(spot.effects[0].id, 7)] },
    { id: 'good2', name: '好調9（2カスタム）', patches: [patch(spot.effects[0].id, 9)] },
    { id: 'score', name: 'パラメータ6', patches: [patch(spot.effects[1].id, 1, 'set', 'count')] },
    { id: 'mixed', name: '好調7・パラメータ6', patches: [patch(spot.effects[0].id, 7), patch(spot.effects[1].id, 1, 'set', 'count')] },
  ];
  spot.variants.enhancements = [
    { id: 'double', name: '++', configured: true, patches: [patch(spot.effects[0].id, 1, 'add')] },
    { id: 'triple', name: '+++', configured: true, patches: [patch(spot.effects[0].id, 2, 'add')] },
  ];
  spot.note = '最終ターンの計算対象は好調と追加パラメータです。元気・体力・カードを引く効果は計算対象外です。';
  const mental = make('精神統一', 'mental', [], [
    effect('concentration', 5),
    effect('concScoreBoost', 20, { duration: 3, goodThreshold: 15 }),
    effect('score', 6, { count: 0 }),
  ]);
  mental.variants.plus = [patch(mental.effects[0].id, 6)];
  mental.variants.customs = [
    { id: 'conc1', name: '集中7（1カスタム）', patches: [patch(mental.effects[0].id, 7)] },
    { id: 'conc2', name: '集中9（2カスタム）', patches: [patch(mental.effects[0].id, 9)] },
    { id: 'score', name: 'パラメータ6', patches: [patch(mental.effects[2].id, 1, 'set', 'count')] },
    { id: 'mixed', name: '集中7・パラメータ6', patches: [patch(mental.effects[0].id, 7), patch(mental.effects[2].id, 1, 'set', 'count')] },
  ];
  for (const enhancement of mental.variants.enhancements) enhancement.patches = [patch(mental.effects[0].id, 0, 'add')];
  mental.note = '好調15以下で集中強化20%（3ターン）。++／+++は集中への加算値を入力してください。元気・体力・ドローは計算対象外です。';
  const signal = make('始まりの合図', 'mental', [], [effect('good', 5), effect('score', 6, { count: 0 })]);
  signal.variants.plus = [patch(signal.effects[0].id, 7)];
  signal.variants.customs = [
    { id: 'good1', name: '好調8', patches: [patch(signal.effects[0].id, 8)] },
    { id: 'good2', name: '好調10（2カスタム）', patches: [patch(signal.effects[0].id, 10)] },
    { id: 'score', name: 'パラメータ6', patches: [patch(signal.effects[1].id, 1, 'set', 'count')] },
    { id: 'mixed', name: '好調8・パラメータ6', patches: [patch(signal.effects[0].id, 8), patch(signal.effects[1].id, 1, 'set', 'count')] },
  ];
  const thrilling = make('スリリング', 'mental', [], [effect('good', 5), effect('score', 6, { count: 0 })]);
  thrilling.variants.plus = [patch(thrilling.effects[0].id, 7)];
  thrilling.variants.customs = [
    { id: 'good', name: '好調9', patches: [patch(thrilling.effects[0].id, 9)] },
    { id: 'score', name: 'パラメータ6', patches: [patch(thrilling.effects[1].id, 1, 'set', 'count')] },
  ];
  const adlib = make('アドリブ', 'active', [], [effect('score', 5), effect('good', 3), effect('concentration', 2, { count: 0 })]);
  adlib.variants.plus = [patch(adlib.effects[0].id, 9), patch(adlib.effects[1].id, 4)];
  adlib.variants.customs = [
    { id: 'score1', name: 'パラメータ15', patches: [patch(adlib.effects[0].id, 15)] },
    { id: 'score2', name: 'パラメータ31（2カスタム）', patches: [patch(adlib.effects[0].id, 31)] },
    { id: 'good1', name: '好調5', patches: [patch(adlib.effects[1].id, 5)] },
    { id: 'good2', name: '好調7（2カスタム）', patches: [patch(adlib.effects[1].id, 7)] },
    { id: 'conc', name: '集中2', patches: [patch(adlib.effects[2].id, 1, 'set', 'count')] },
    { id: 'score-good', name: 'パラメータ15・好調5', patches: [patch(adlib.effects[0].id, 15), patch(adlib.effects[1].id, 5)] },
    { id: 'score-conc', name: 'パラメータ15・集中2', patches: [patch(adlib.effects[0].id, 15), patch(adlib.effects[2].id, 1, 'set', 'count')] },
    { id: 'good-conc', name: '好調5・集中2', patches: [patch(adlib.effects[1].id, 5), patch(adlib.effects[2].id, 1, 'set', 'count')] },
  ];
  const macchiato = make('厳選初星マキアート', 'drink', [], [], false);
  macchiato.id = 'route-drink:macchiato';
  macchiato.endTurnEffects = [effect('concentration', 1)];
  macchiato.variants = { plus: [], customs: [], enhancements: [] };
  return [presence, chant, passion, path, summer, tea, spot, mental, signal, thrilling, adlib, macchiato];
}

// Legacy effects are retained exactly in a selectable custom preset, including user edits.
function migrateLegacy(cards, route) {
  const catalog = makeCatalog();
  const groups = new Map();
  const mapping = new Map();
  const result = [];
  for (const old of cards) {
    const name = old.name.replace(/\++$/, '');
    const canonical = name === 'シュプレヒコール' ? 'シュプ' : name;
    let target = groups.get(canonical);
    if (!target) {
      target = catalog.find(c => c.name === canonical);
      target = target ? structuredClone(target) : ensureVariants(structuredClone(old));
      target.id = old.id;
      target.name = canonical;
      groups.set(canonical, target);
      result.push(target);
    }
    const preset = { id: crypto.randomUUID(), name: `旧設定：${old.name}`, patches: [] };
    // A snapshot is used for old presets: no dormant score effects can accidentally score concentration.
    preset.snapshot = { preEffects: structuredClone(old.preEffects), effects: structuredClone(old.effects), reservedEffects: structuredClone(old.reservedEffects ?? []), kind: old.kind, ljReaction: old.ljReaction };
    target.variants.customs.push(preset);
    mapping.set(old.id, { cardId: target.id, base: 'plus', custom: preset.id, enhancement: '' });
  }
  if (!groups.has('スポットライト')) result.push(catalog.find(c => c.name === 'スポットライト'));
  return { cards: result, route: route.map(entry => mapping.get(entryId(entry))).filter(Boolean) };
}

return {blankConfig, entryId, ensureVariants, resolveCard, makeCatalog, migrateLegacy};
})();
