const {blankConfig, ensureVariants, resolveCard} = RouteCardModel;
const $ = (id) => document.getElementById(id);
let STORAGE_KEY = 'last-turn-route-tool:v1';
const IMPORT_BACKUP_KEY = 'last-turn-route-tool:before-import';
const ATTRIBUTES = ['vo', 'da', 'vi'];
const ATTRIBUTE_LABELS = { vo: 'Vo', da: 'Da', vi: 'Vi' };
const CARD_KIND_LABELS = { active: 'アクティブ', mental: 'メンタル', drink: 'その他' };

const EFFECT_TYPES = [
  { value: 'score', label: 'パラメータ+' },
  { value: 'goodScore', label: '好調の%分パラメータ' },
  { value: 'concentration', label: '集中+' },
  { value: 'good', label: '好調+' },
  { value: 'paramBoost', label: 'パラメ増加%+' },
  { value: 'concGainBoost', label: '集中増加%+' },
  { value: 'concScoreBoost', label: '集中強化%+' },
];

const EXTERNAL_EFFECTS = [
  { id: 'negai', label: '願いの力' },
  { id: 'entertainment', label: '至高のエンタメ' },
  { id: 'natsuya', label: '夏夜' },
];
const DEFAULT_EXTERNAL_ORDER = EXTERNAL_EFFECTS.filter((effect) => effect.id !== 'natsuya').map((effect) => effect.id);

const SCENARIO_INPUT_IDS = [
  'good-gain-boost-fresh',
  'conc-gain-boost-fresh',
  'conc-score-boost-fresh', 'conc-score-boost-fresh-2', 'conc-score-boost-fresh-3',
  'previous-score', 'remaining-turns', 'initial-concentration', 'initial-good', 'initial-param-boost',
  'initial-conc-gain-boost', 'conc-gain-boost-turns', 'initial-good-gain-boost', 'good-gain-boost-turns', 'initial-conc-score-boost', 'conc-score-boost-turns', 'initial-conc-score-boost-2', 'conc-score-boost-turns-2', 'initial-conc-score-boost-3', 'conc-score-boost-turns-3', 'super-good',
  'vo-multiplier', 'da-multiplier', 'vi-multiplier', 'scenario-memo',
];

function uuid() {
  return crypto.randomUUID();
}

function makeEffect(overrides = {}) {
  return {
    id: uuid(), type: 'score', value: 0, count: 1, concRate: 1, goodRate: 1,
    upgradeEnabled: false, upgradeValue: 0, upgradeCount: 1, upgradeConcRate: 1, upgradeGoodRate: 1,
    ...overrides,
  };
}

function makeReservedEffect(overrides = {}) {
  return makeEffect({
    delay: 1, repeat: 1, interval: 1,
    upgradeDelay: 1, upgradeRepeat: 1, upgradeInterval: 1,
    ...overrides,
  });
}

function makeDefaultCards() {
  if (typeof INITIAL_CARD_DEFINITIONS !== 'undefined') return structuredClone(INITIAL_CARD_DEFINITIONS.cards);
  const cards = [
    {
      id: uuid(), name: '存在感', kind: 'mental', ljReaction: true, preEffects: [],
      effects: [makeEffect({ type: 'good', value: -1 }), makeEffect({ type: 'concentration', value: 5 })],
    },
    {
      id: uuid(), name: 'シュプ++', kind: 'active', ljReaction: false, preEffects: [],
      effects: [makeEffect({ type: 'score', value: 12 }), makeEffect({ type: 'good', value: 3 })],
    },
    {
      id: uuid(), name: 'シュプ', kind: 'active', ljReaction: false, preEffects: [],
      effects: [makeEffect({ type: 'score', value: 6 }), makeEffect({ type: 'good', value: 3 })],
    },
    {
      id: uuid(), name: '情熱ターン', kind: 'active', ljReaction: true, preEffects: [],
      effects: [makeEffect({ type: 'score', value: 18 }), makeEffect({ type: 'concentration', value: 4 })],
    },
    {
      id: uuid(), name: '道筋', kind: 'mental', ljReaction: true, preEffects: [],
      effects: [makeEffect({ type: 'good', value: -1 }), makeEffect({ type: 'concentration', value: 9 })],
    },
    { id: uuid(), name: '夏夜', kind: 'active', ljReaction: false, preEffects: [], effects: [], reservedEffects: [] },
    {
      id: uuid(), name: 'センブリ', kind: 'drink', ljReaction: false, preEffects: [],
      effects: [makeEffect({ type: 'paramBoost', value: 10 })],
    },
    {
      id: uuid(), name: '破竹の勢い', kind: 'mental', ljReaction: false, preEffects: [],
      effects: [makeEffect({ type: 'concentration', value: 5, upgradeEnabled: true, upgradeValue: 7 })],
      reservedEffects: [makeReservedEffect({
        type: 'score', value: 5, delay: 1, repeat: 3, interval: 1,
        upgradeEnabled: true, upgradeValue: 5, upgradeRepeat: 4,
      })],
    },
    {
      id: uuid(), name: '魅惑のパフォーマンス', kind: 'active', ljReaction: false, preEffects: [], effects: [],
      reservedEffects: [
        makeReservedEffect({ type: 'score', value: 38, delay: 1, upgradeEnabled: true, upgradeValue: 47 }),
        makeReservedEffect({ type: 'score', value: 21, delay: 2, goodRate: 2 }),
      ],
    },
    {
      id: uuid(), name: '成就', kind: 'active', ljReaction: false, preEffects: [],
      effects: [makeEffect({ type: 'good', value: 4, upgradeEnabled: true, upgradeValue: 7 })],
      reservedEffects: [makeReservedEffect({ type: 'score', value: 32, delay: 1, upgradeEnabled: true, upgradeValue: 40 })],
    },
  ];
  const catalog = RouteCardModel.makeCatalog();
  for (const card of cards) {
    if (['破竹の勢い', '魅惑のパフォーマンス', '成就'].includes(card.name)) catalog.push(ensureVariants({ reservedEffects: [], ...card }));
  }
  return catalog;

}

function defaultScenario() {
  return {
    previousScore: 0,
    showFinalScore: false,
    remainingTurns: 1,
    concentration: 125,
    good: 74,
    paramBoost: 60,
    concGainBoost: 50,
    goodGainBoost: 0,
    concGainBoostTurns: 1,
    concGainBoostFresh: false,
    goodGainBoostTurns: 1,
    goodGainBoostFresh: false,
    concScoreBoost: 0,
    concScoreBoostTurns: 1,
    superGood: true,
    multipliers: { vo: 4300, da: 4300, vi: 4300 },
    memo: '',
    negai: { enabled: true, concentration: 1 },
    entertainment: { enabled: false, enhanced: false, score: 4, concRate: 1, national: false },
    natsuya: { enabled: true, remaining: 3, interval: 5, score: 4 },
    lj: { enabled: true, score: 14, concRate: 1.5, national: false },
    ljPitem: { enabled: true, activeRemaining: 1, uses: 1, concGainBoost: 25 },
    tenshin: { enabled: false },
    kyakkou: { enabled: false, upgradeLevel: 0, enhanced: false, national: false, count: 0 },
    carryInCards: [],
  };
}

function makeRoute(name, remainingTurns = 1) {
  return {
    id: uuid(),
    name,
    memo: '',
    turns: Array.from({ length: remainingTurns }, () => ({ attribute: 'vo', cardIds: [], upgraded: [] })),
  };
}

function makeDefaultState() {
  const cards = makeDefaultCards();
  const route = makeRoute('ルート1', 1);
  route.turns[0].cardIds = ['存在感', '道筋', '情熱ターン', 'シュプ'].map(name => cards.find(c => c.name === name).id);
  route.turns[0].configs = route.turns[0].cardIds.map((id, i) => ({ ...blankConfig(), enhancement: i === 3 ? 'double' : '' }));
  return {
    cards,
    scenario: defaultScenario(),
    scenePresets: [],
    externalOrder: [...DEFAULT_EXTERNAL_ORDER],
    routes: [route],
    selectedCardId: cards[0].id,
    selectedRouteId: route.id,
    selectedResultRouteId: route.id,
    selectedScenePresetId: '',
    activeStep: 0,
    logDetail: false,
  };
}

let state = makeDefaultState();
let isRestoring = false;
let saveTimer = null;
let latestResults = [];
let cardEditorOpen = false;
let routeEditTarget = null;

function clampInt(value, min, max, fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function number(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function fmt(value, digits = 0) {
  const normalized = Math.abs(value) < 0.000001 ? 0 : value;
  return normalized.toLocaleString('ja-JP', { maximumFractionDigits: digits });
}

function signed(value, suffix = '') {
  return `${value >= 0 ? '+' : ''}${fmt(value, 2)}${suffix}`;
}

function option(value, label, selected = false) {
  const node = document.createElement('option');
  node.value = value;
  node.textContent = label;
  node.selected = selected;
  return node;
}

function button(text, className, onClick) {
  const node = document.createElement('button');
  node.type = 'button';
  node.textContent = text;
  if (className) node.className = className;
  node.addEventListener('click', onClick);
  return node;
}

function getCard(id) {
  return state.cards.find((card) => card.id === id) ?? null;
}

function getSelectedRoute() {
  return state.routes.find((route) => route.id === state.selectedRouteId) ?? state.routes[0] ?? null;
}

function normalizeEffect(raw = {}) {
  const value = number(raw.value);
  const count = Math.max(0, Math.floor(number(raw.count, 1)));
  const concRate = number(raw.concRate, 1);
  const goodRate = number(raw.goodRate ?? raw.goodMultRate, 1);
  return {
    ...raw,
    id: raw.id || uuid(),
    type: raw.type || 'score',
    value,
    count,
    concRate,
    goodRate,
    upgradeEnabled: Boolean(raw.upgradeEnabled),
    upgradeValue: number(raw.upgradeValue, value),
    upgradeCount: Math.max(1, Math.floor(number(raw.upgradeCount, count))),
    upgradeConcRate: number(raw.upgradeConcRate, concRate),
    upgradeGoodRate: number(raw.upgradeGoodRate, goodRate),
  };
}

function normalizeReservedEffect(raw = {}) {
  const effect = normalizeEffect(raw);
  const delay = clampInt(raw.delay, 1, 99, 1);
  const repeat = clampInt(raw.repeat, 1, 99, 1);
  const interval = clampInt(raw.interval, 1, 99, 1);
  return {
    ...effect,
    delay,
    repeat,
    interval,
    upgradeDelay: clampInt(raw.upgradeDelay, 1, 99, delay),
    upgradeRepeat: clampInt(raw.upgradeRepeat, 1, 99, repeat),
    upgradeInterval: clampInt(raw.upgradeInterval, 1, 99, interval),
  };
}

function normalizeCards(rawCards) {
  if (!Array.isArray(rawCards) || rawCards.length === 0) return makeDefaultCards();
  return rawCards.map((raw = {}) => ({
    ...raw,
    id: raw.id || uuid(),
    name: raw.name || '無名カード',
    kind: ['active', 'mental', 'drink'].includes(raw.kind) ? raw.kind : 'active',
    ljReaction: Boolean(raw.ljReaction),
    preEffects: Array.isArray(raw.preEffects) ? raw.preEffects.map(normalizeEffect) : [],
    effects: Array.isArray(raw.effects) ? raw.effects.map(normalizeEffect) : [],
    reservedEffects: Array.isArray(raw.reservedEffects) ? raw.reservedEffects.map(normalizeReservedEffect) : [],
    ...(Array.isArray(raw.endTurnEffects) ? { endTurnEffects: raw.endTurnEffects.map(normalizeEffect) } : {}),
  }));
}

function addReservedCardDefaults(cards) {
  const names = new Set(['破竹の勢い', '魅惑のパフォーマンス', '成就']);
  makeDefaultCards().filter((card) => names.has(card.name)).forEach((card) => {
    if (!cards.some((existing) => existing.name === card.name)) cards.push(card);
  });
  return cards;
}

function normalizeCardIds(rawIds, cards) {
  if (!Array.isArray(rawIds)) return [];
  return rawIds.map((entry) => {
    if (cards.some((card) => card.id === entry)) return entry;
    return cards.find((card) => card.name === entry)?.id ?? null;
  }).filter(Boolean);
}

function normalizeExternalOrder(rawOrder) {
  const normalized = Array.isArray(rawOrder)
    ? rawOrder.filter((id) => DEFAULT_EXTERNAL_ORDER.includes(id))
    : [];
  DEFAULT_EXTERNAL_ORDER.forEach((id) => {
    if (!normalized.includes(id)) normalized.push(id);
  });
  return normalized;
}

function normalizeScenePresets(rawPresets) {
  if (!Array.isArray(rawPresets)) return [];
  const usedIds = new Set();
  return rawPresets.map((raw, index) => {
    const fallbackId = uuid();
    const requestedId = raw?.id || fallbackId;
    const id = usedIds.has(requestedId) ? fallbackId : requestedId;
    usedIds.add(id);
    return {
      id,
      name: String(raw?.name || `局面${index + 1}`).trim() || `局面${index + 1}`,
      scenario: normalizeScenario(raw?.scenario),
      externalOrder: normalizeExternalOrder(raw?.externalOrder),
    };
  });
}

function scenarioFromV1(inputs = {}, memo = '') {
  const defaults = defaultScenario();
  const legacyMultiplier = number(inputs['turn-multiplier'], 4300);
  return {
    ...defaults,
    remainingTurns: 1,
    concentration: number(inputs['initial-concentration'], defaults.concentration),
    good: number(inputs['initial-good'], defaults.good),
    paramBoost: number(inputs['initial-param-boost'], defaults.paramBoost),
    concGainBoost: number(inputs['initial-conc-gain-boost'], defaults.concGainBoost),
    goodGainBoost: number(inputs['initial-good-gain-boost'], defaults.goodGainBoost),
    concGainBoostTurns: clampInt(inputs['conc-gain-boost-turns'], 0, 99, 1),
    concGainBoostFresh: Boolean(inputs['conc-gain-boost-fresh']),
    goodGainBoostTurns: clampInt(inputs['good-gain-boost-turns'], 0, 99, 1),
    goodGainBoostFresh: Boolean(inputs['good-gain-boost-fresh']),
    concScoreBoost: number(inputs['initial-conc-score-boost'], defaults.concScoreBoost),
    concScoreBoostTurns: clampInt(inputs['conc-score-boost-turns'], 0, 99, 1),
    superGood: inputs['super-good'] ?? defaults.superGood,
    multipliers: { vo: legacyMultiplier, da: legacyMultiplier, vi: legacyMultiplier },
    memo,
    negai: {
      enabled: inputs['negai-enabled'] ?? defaults.negai.enabled,
      concentration: number(inputs['negai-conc'], defaults.negai.concentration),
    },
    entertainment: {
      enabled: inputs['entertainment-enabled'] ?? defaults.entertainment.enabled,
      enhanced: number(inputs['entertainment-score'], 4) >= 5,
      score: 4,
      concRate: 1,
      national: inputs['entertainment-national'] ?? defaults.entertainment.national,
    },
    natsuya: {
      enabled: inputs['natsuya-enabled'] ?? defaults.natsuya.enabled,
      remaining: clampInt(inputs['natsuya-remaining'], 1, 999, defaults.natsuya.remaining),
      interval: 5,
      score: 4,
    },
    lj: {
      enabled: inputs['lj-enabled'] ?? defaults.lj.enabled,
      score: number(inputs['lj-score'], defaults.lj.score),
      concRate: number(inputs['lj-conc-rate'], defaults.lj.concRate),
      national: inputs['lj-national'] ?? defaults.lj.national,
    },
    ljPitem: {
      enabled: inputs['lj-pitem-enabled'] ?? defaults.ljPitem.enabled,
      activeRemaining: clampInt(inputs['lj-pitem-active-remaining'], 1, 999, defaults.ljPitem.activeRemaining),
      uses: clampInt(inputs['lj-pitem-uses'], 0, 999, defaults.ljPitem.uses),
      concGainBoost: number(inputs['lj-pitem-conc-gain-boost'], defaults.ljPitem.concGainBoost),
    },
  };
}

function normalizeScenario(raw = {}) {
  const defaults = defaultScenario();
  const remainingTurns = clampInt(raw.remainingTurns, 1, 10, 1);
  const rawEntertainment = raw.entertainment ?? {};
  return {
    ...defaults,
    ...raw,
    remainingTurns,
    previousScore: Math.max(0, Math.floor(number(raw.previousScore, 0))),
    showFinalScore: Boolean(raw.showFinalScore),
    concentration: number(raw.concentration, defaults.concentration),
    good: number(raw.good, defaults.good),
    paramBoost: number(raw.paramBoost, defaults.paramBoost),
    concGainBoost: number(raw.concGainBoost, defaults.concGainBoost),
    goodGainBoost: number(raw.goodGainBoost, defaults.goodGainBoost),
    concGainBoostTurns: clampInt(raw.concGainBoostTurns, 0, 99, defaults.concGainBoostTurns),
    concGainBoostFresh: Boolean(raw.concGainBoostFresh),
    goodGainBoostTurns: clampInt(raw.goodGainBoostTurns, 0, 99, defaults.goodGainBoostTurns),
    goodGainBoostFresh: Boolean(raw.goodGainBoostFresh),
    concScoreBoostRows: normalizeConcScoreRows(raw),
    concScoreBoost: normalizeConcScoreRows(raw)[0].percent,
    concScoreBoostTurns: normalizeConcScoreRows(raw)[0].turns,
    superGood: raw.superGood ?? defaults.superGood,
    multipliers: {
      vo: number(raw.multipliers?.vo, defaults.multipliers.vo),
      da: number(raw.multipliers?.da, defaults.multipliers.da),
      vi: number(raw.multipliers?.vi, defaults.multipliers.vi),
    },
    tenshin: { enabled: Boolean(raw.tenshin?.enabled) },
    kyakkou: {
      enabled: Boolean(raw.kyakkou?.enabled),
      upgradeLevel: clampInt(raw.kyakkou?.upgradeLevel, 0, 2, raw.kyakkou?.enhanced ? 1 : 0),
      enhanced: clampInt(raw.kyakkou?.upgradeLevel, 0, 2, raw.kyakkou?.enhanced ? 1 : 0) > 0,
      national: Boolean(raw.kyakkou?.national), count: clampInt(raw.kyakkou?.count, 0, 1, 0),
    },
    negai: { ...defaults.negai, ...(raw.negai ?? {}) },
    entertainment: {
      ...defaults.entertainment,
      ...rawEntertainment,
      enhanced: rawEntertainment.enhanced ?? number(rawEntertainment.score, 4) >= 5,
      score: 4,
      concRate: 1,
    },
    natsuya: { ...defaults.natsuya, ...(raw.natsuya ?? {}) },
    lj: { ...defaults.lj, ...(raw.lj ?? {}) },
    ljPitem: { ...defaults.ljPitem, ...(raw.ljPitem ?? {}) },
    carryInCards: Array.isArray(raw.carryInCards) ? raw.carryInCards.map((item = {}) => ({
      id: item.id || uuid(),
      cardId: String(item.cardId || ''),
      upgraded: Boolean(item.upgraded),
      config: item.config ? structuredClone(item.config) : undefined,
      usedAtRemaining: clampInt(item.usedAtRemaining, 1, 99, remainingTurns + 1),
    })) : [],
  };
}

function normalizeRoutes(rawRoutes, cards, remainingTurns) {
  if (!Array.isArray(rawRoutes)) return [makeRoute('ルート1', remainingTurns)];
  return rawRoutes.map((raw, routeIndex) => {
    const rawTurns = Array.isArray(raw.turns) ? raw.turns : [];
    const turns = rawTurns.slice(-remainingTurns).map((turn) => {
      const cardIds = normalizeCardIds(turn?.cardIds, cards);
      const rawUpgraded = Array.isArray(turn?.upgraded) ? turn.upgraded : [];
      return {
        attribute: ATTRIBUTES.includes(turn?.attribute) ? turn.attribute : 'vo',
        cardIds,
        upgraded: cardIds.map((_, index) => Boolean(rawUpgraded[index])),
        configs: cardIds.map((_, index) => turn.configs?.[index] ? structuredClone(turn.configs[index]) : null),
      };
    });
    while (turns.length < remainingTurns) turns.unshift({ attribute: 'vo', cardIds: [], upgraded: [] });
    return {
      id: raw.id || uuid(),
      name: raw.name || `ルート${routeIndex + 1}`,
      memo: raw.memo ?? '',
      turns,
    };
  });
}

function readSavedData(data) {
  if (!data || typeof data !== 'object') throw new Error('JSONの形式が正しくありません。');
  let cards = normalizeCards(data.cards ?? data.cardLibrary);
  if (!Number.isFinite(Number(data.version)) || Number(data.version) < 4) cards = addReservedCardDefaults(cards);
  if (Number(data.version) >= 2 && data.scenario) {
    const scenario = normalizeScenario(data.scenario);
    const routes = normalizeRoutes(data.routes, cards, scenario.remainingTurns);
    const scenePresets = normalizeScenePresets(data.scenePresets);
    return {
      cards,
      scenario,
      scenePresets,
      routeDefaults: structuredClone(data.routeDefaults ?? {}),
      routes,
      externalOrder: normalizeExternalOrder(data.externalOrder),
      selectedCardId: cards.some((card) => card.id === data.ui?.selectedCardId) ? data.ui.selectedCardId : cards[0]?.id,
      selectedRouteId: routes.some((route) => route.id === data.ui?.selectedRouteId) ? data.ui.selectedRouteId : routes[0]?.id,
      selectedResultRouteId: routes.some((route) => route.id === data.ui?.selectedResultRouteId) ? data.ui.selectedResultRouteId : routes[0]?.id,
      selectedScenePresetId: scenePresets.some((preset) => preset.id === data.ui?.selectedScenePresetId) ? data.ui.selectedScenePresetId : '',
      activeStep: clampInt(data.ui?.activeStep, 0, 3, 0),
      logDetail: Boolean(data.ui?.logDetail),
    };
  }

  const scenario = scenarioFromV1(data.inputs, data.memo);
  const route = makeRoute('ルート1', 1);
  route.memo = data.memo ?? '';
  route.turns[0].cardIds = normalizeCardIds(data.route, cards);
  return {
    cards,
    scenario,
    scenePresets: [],
    routes: [route],
    externalOrder: normalizeExternalOrder(data.externalOrder),
    selectedCardId: cards[0]?.id,
    selectedRouteId: route.id,
    selectedResultRouteId: route.id,
    selectedScenePresetId: '',
    activeStep: 0,
    logDetail: Boolean(data.inputs?.['log-detail']),
  };
}

function legacyInputs() {
  const s = state.scenario;
  return {
    'previous-score': s.previousScore,
    'initial-concentration': s.concentration,
    'initial-good': s.good,
    'initial-param-boost': s.paramBoost,
    'initial-conc-gain-boost': s.concGainBoost,
    'initial-good-gain-boost': s.goodGainBoost,
    'conc-gain-boost-turns': s.concGainBoostTurns,
    'conc-gain-boost-fresh': s.concGainBoostFresh,
    'good-gain-boost-turns': s.goodGainBoostTurns,
    'good-gain-boost-fresh': s.goodGainBoostFresh,
    ...Object.fromEntries(normalizeConcScoreRows(s).flatMap((row, index) => {
      const suffix = index === 0 ? '' : '-' + (index + 1);
      return [['initial-conc-score-boost' + suffix, row.percent], ['conc-score-boost-turns' + suffix, row.turns], ['conc-score-boost-fresh' + suffix, row.fresh]];
    })),
    'turn-multiplier': s.multipliers.vo,
    'super-good': s.superGood,
    'negai-enabled': s.negai.enabled,
    'negai-conc': s.negai.concentration,
    'entertainment-enabled': s.entertainment.enabled,
    'entertainment-score': s.entertainment.enhanced ? 5 : 4,
    'entertainment-conc-rate': 1,
    'entertainment-national': s.entertainment.national,
    'natsuya-enabled': s.natsuya.enabled,
    'natsuya-remaining': s.natsuya.remaining,
    'natsuya-interval': 5,
    'natsuya-score': 4,
    'lj-enabled': s.lj.enabled,
    'lj-score': s.lj.score,
    'lj-conc-rate': s.lj.concRate,
    'lj-national': s.lj.national,
    'lj-pitem-enabled': s.ljPitem.enabled,
    'lj-pitem-active-remaining': s.ljPitem.activeRemaining,
    'lj-pitem-uses': s.ljPitem.uses,
    'lj-pitem-conc-gain-boost': s.ljPitem.concGainBoost,
    'log-detail': state.logDetail,
  };
}

function collectSaveData() {
  const selectedRoute = getSelectedRoute();
  return {
    version: 8,
    savedAt: new Date().toISOString(),
    cards: structuredClone(state.cards),
    cardLibrary: structuredClone(state.cards),
    scenario: structuredClone(state.scenario),
    scenePresets: structuredClone(state.scenePresets),
    routes: structuredClone(state.routes),
    externalOrder: [...state.externalOrder],
    ui: {
      selectedCardId: state.selectedCardId,
      selectedRouteId: state.selectedRouteId,
      selectedResultRouteId: state.selectedResultRouteId,
      selectedScenePresetId: state.selectedScenePresetId,
      activeStep: state.activeStep,
      logDetail: state.logDetail,
    },
    // v1系ツールで内容を確認しやすいよう、主要フィールドも残す。
    route: selectedRoute?.turns.flatMap((turn) => turn.cardIds) ?? [],
    memo: state.scenario.memo,
    inputs: legacyInputs(),
  };
}

function collectRouteShareData() {
  const routeId = state.activeStep === 3 ? state.selectedResultRouteId : state.selectedRouteId;
  const route = state.routes.find(item => item.id === routeId) ?? getSelectedRoute();
  if (!route) throw new Error('書き出すルートがありません。');
  const full = collectSaveData();
  const ids = new Set(route.turns.flatMap(turn => turn.cardIds));
  for (const entry of full.scenario.carryInCards ?? []) ids.add(entry.cardId);
  const cards = full.cards.filter(card => ids.has(card.id));
  return {
    version: full.version, savedAt: full.savedAt, kind: 'route-share', plan: full.plan ?? 'sense',
    cards, scenario: full.scenario, routes: [structuredClone(route)], externalOrder: full.externalOrder,
    ui: { selectedRouteId: route.id, selectedResultRouteId: route.id, selectedCardId: cards[0]?.id, activeStep: 3 },
  };
}

async function exportSelectedRoute() {
  try {
    const data = collectRouteShareData();
    const json = JSON.stringify(data);
    $('save-json').value = json;
    const dialog = $('data-dialog');
    if (!dialog.open) dialog.showModal();
    try {
      await navigator.clipboard.writeText(json);
      setSaveStatus('「' + data.routes[0].name + '」をコピーしました');
    } catch {
      $('save-json').focus(); $('save-json').select();
      setSaveStatus('ルートを書き出しました。選択された内容をコピーできます');
    }
  } catch (error) { setSaveStatus('ルート書き出し失敗: ' + error.message); }
}

function setSaveStatus(message) {
  $('save-status').textContent = message;
}

function saveNow(message = '保存しました') {
  if (isRestoring) return;
  clearTimeout(saveTimer);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectSaveData()));
    setSaveStatus(`${message} ${new Date().toLocaleTimeString('ja-JP')}`);
  } catch (error) {
    setSaveStatus(`保存失敗: ${error.message}`);
  }
}

function queueSave() {
  if (isRestoring) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveNow('自動保存'), 180);
}

function restoreState(data) {
  isRestoring = true;
  try {
    state = migrateSavedData(data);
    applyScenarioToInputs();
    $('log-detail').checked = state.logDetail;
    renderAll();
  } finally {
    isRestoring = false;
  }
}

function loadSavedData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    restoreState(JSON.parse(raw));
    setSaveStatus('保存データを復元しました');
    return true;
  } catch (error) {
    console.warn(error);
    setSaveStatus(`復元失敗: ${error.message}`);
    return false;
  }
}

function applyScenarioToInputs() {
  const s = state.scenario;
  const values = {
    'remaining-turns': s.remainingTurns,
    'previous-score': s.previousScore,
    'initial-concentration': s.concentration,
    'initial-good': s.good,
    'initial-param-boost': s.paramBoost,
    'initial-conc-gain-boost': s.concGainBoost,
    'initial-good-gain-boost': s.goodGainBoost,
    'conc-gain-boost-turns': s.concGainBoostTurns,
    'conc-gain-boost-fresh': s.concGainBoostFresh,
    'good-gain-boost-turns': s.goodGainBoostTurns,
    'good-gain-boost-fresh': s.goodGainBoostFresh,
    ...Object.fromEntries(normalizeConcScoreRows(s).flatMap((row, index) => {
      const suffix = index === 0 ? '' : '-' + (index + 1);
      return [['initial-conc-score-boost' + suffix, row.percent], ['conc-score-boost-turns' + suffix, row.turns], ['conc-score-boost-fresh' + suffix, row.fresh]];
    })),
    'super-good': s.superGood,
    'vo-multiplier': s.multipliers.vo,
    'da-multiplier': s.multipliers.da,
    'vi-multiplier': s.multipliers.vi,
    'scenario-memo': s.memo,
    'negai-enabled': s.negai.enabled,
    'negai-conc': s.negai.concentration,
    'entertainment-enabled': s.entertainment.enabled,
    'entertainment-score': s.entertainment.enhanced ? 5 : 4,
    'entertainment-conc-rate': 1,
    'entertainment-national': s.entertainment.national,
    'natsuya-enabled': s.natsuya.enabled,
    'natsuya-remaining': s.natsuya.remaining,
    'natsuya-interval': 5,
    'natsuya-score': 4,
    'lj-enabled': s.lj.enabled,
    'lj-score': s.lj.score,
    'lj-conc-rate': s.lj.concRate,
    'lj-national': s.lj.national,
    'lj-pitem-enabled': s.ljPitem.enabled,
    'lj-pitem-active-remaining': s.ljPitem.activeRemaining,
    'lj-pitem-uses': s.ljPitem.uses,
    'lj-pitem-conc-gain-boost': s.ljPitem.concGainBoost,
  };
  Object.entries(values).forEach(([id, value]) => {
    const input = $(id);
    if (!input) return;
    if (input.type === 'checkbox') input.checked = Boolean(value);
    else input.value = value ?? '';
  });
}

function readScenarioFromInputs() {
  const previousTurnCount = state.scenario.remainingTurns;
  const remainingTurns = clampInt($('remaining-turns').value, 1, 10, previousTurnCount);
  state.scenario = normalizeScenario({
    ...state.scenario,
    remainingTurns,
    previousScore: number($('previous-score').value),
    concentration: number($('initial-concentration').value),
    good: number($('initial-good').value),
    paramBoost: number($('initial-param-boost').value),
    concGainBoost: number($('initial-conc-gain-boost').value),
    goodGainBoost: number($('initial-good-gain-boost').value),
    concGainBoostTurns: clampInt($('conc-gain-boost-turns').value, 0, 99, 0),
    concGainBoostFresh: $('conc-gain-boost-fresh').checked,
    goodGainBoostTurns: clampInt($('good-gain-boost-turns').value, 0, 99, 0),
    goodGainBoostFresh: $('good-gain-boost-fresh').checked,
    concScoreBoostRows: [1, 2, 3].map(index => {
      const suffix = index === 1 ? '' : '-' + index;
      return { percent: Math.max(0, number($('initial-conc-score-boost' + suffix).value)), turns: clampInt($('conc-score-boost-turns' + suffix).value, 0, 99, 0), fresh: $('conc-score-boost-fresh' + suffix).checked };
    }),
    concScoreBoost: number($('initial-conc-score-boost').value),
    concScoreBoostTurns: clampInt($('conc-score-boost-turns').value, 0, 99, 0),
    superGood: $('super-good').checked,
    multipliers: {
      vo: number($('vo-multiplier').value),
      da: number($('da-multiplier').value),
      vi: number($('vi-multiplier').value),
    },
    memo: $('scenario-memo').value,
  });
  if (remainingTurns !== previousTurnCount) {
    state.routes.forEach((route) => resizeRouteTurns(route, previousTurnCount, remainingTurns));
  }
}

function resizeRouteTurns(route, oldCount, newCount) {
  if (newCount > oldCount) {
    route.turns.unshift(...Array.from({ length: newCount - oldCount }, () => ({ attribute: 'vo', cardIds: [], upgraded: [] })));
  } else if (newCount < oldCount) {
    route.turns.splice(0, oldCount - newCount);
  }
}

function getSelectedScenePreset() {
  return state.scenePresets.find((preset) => preset.id === state.selectedScenePresetId) ?? null;
}

function renderScenePresets() {
  const select = $('scene-preset-select');
  select.textContent = '';
  select.append(option('', state.scenePresets.length ? 'プリセットを選択' : '保存済みなし', !state.selectedScenePresetId));
  state.scenePresets.forEach((preset) => {
    select.append(option(preset.id, preset.name, preset.id === state.selectedScenePresetId));
  });
  const selected = Boolean(getSelectedScenePreset());
  $('load-scene-preset').disabled = !selected;
  $('overwrite-scene-preset').disabled = !selected;
  $('delete-scene-preset').disabled = !selected;
}

function scenePresetSnapshot(name, id = uuid()) {
  readScenarioFromInputs();
  return {
    id,
    name,
    scenario: structuredClone(state.scenario),
    externalOrder: [...state.externalOrder],
  };
}

function saveNewScenePreset() {
  const suggested = `局面${state.scenePresets.length + 1}`;
  const name = prompt('プリセット名', suggested)?.trim();
  if (!name) return;
  const sameName = state.scenePresets.find((preset) => preset.name === name);
  if (sameName) {
    if (!confirm(`「${name}」を上書きしますか？`)) return;
    const index = state.scenePresets.indexOf(sameName);
    state.scenePresets[index] = scenePresetSnapshot(name, sameName.id);
    state.selectedScenePresetId = sameName.id;
  } else {
    const preset = scenePresetSnapshot(name);
    state.scenePresets.push(preset);
    state.selectedScenePresetId = preset.id;
  }
  renderScenePresets();
  saveNow('プリセットを保存しました');
}

function overwriteScenePreset() {
  const preset = getSelectedScenePreset();
  if (!preset) return;
  const index = state.scenePresets.indexOf(preset);
  state.scenePresets[index] = scenePresetSnapshot(preset.name, preset.id);
  renderScenePresets();
  saveNow('プリセットを上書きしました');
}

function loadScenePreset() {
  const preset = getSelectedScenePreset();
  if (!preset) return;
  const oldTurnCount = state.scenario.remainingTurns;
  const nextScenario = normalizeScenario(structuredClone(preset.scenario));
  if (oldTurnCount !== nextScenario.remainingTurns) {
    const message = `残りターンを${oldTurnCount}から${nextScenario.remainingTurns}へ変更します。ルートのターン数も調整しますか？`;
    if (!confirm(message)) return;
    state.routes.forEach((route) => resizeRouteTurns(route, oldTurnCount, nextScenario.remainingTurns));
  }
  state.scenario = nextScenario;
  state.externalOrder = normalizeExternalOrder(preset.externalOrder);
  applyScenarioToInputs();
  renderExternalOrder();
  renderCarryInCards();
  recalculate();
  renderRoutes();
  saveNow('プリセットを読み込みました');
}

function deleteScenePreset() {
  const preset = getSelectedScenePreset();
  if (!preset || !confirm(`「${preset.name}」を削除しますか？`)) return;
  state.scenePresets = state.scenePresets.filter((item) => item.id !== preset.id);
  state.selectedScenePresetId = '';
  renderScenePresets();
  saveNow('プリセットを削除しました');
}

function showStep(index) {
  state.activeStep = clampInt(index, 0, 3, 0);
  document.querySelectorAll('[data-screen]').forEach((screen) => {
    screen.classList.toggle('active', Number(screen.dataset.screen) === state.activeStep);
  });
  document.querySelectorAll('[data-step]').forEach((step) => {
    const active = Number(step.dataset.step) === state.activeStep;
    step.classList.toggle('active', active);
    step.setAttribute('aria-current', active ? 'step' : 'false');
  });
  $('previous-step').disabled = state.activeStep === 0;
  $('next-step').disabled = state.activeStep === 3;
  if (state.activeStep === 2) renderRoutes();
  if (state.activeStep === 3) renderResults();
  queueSave();
}

function getLibraryCards() {
  return state.cards.filter(card => card.id !== 'route-drink:macchiato');
}

function renderCardLibrary() {
  if (state.selectedCardId === 'route-drink:macchiato') state.selectedCardId = getLibraryCards()[0]?.id ?? null;
  const list = $('card-library');
  list.textContent = '';
  renderSelectedCardBar();
  const query = $('card-search').value.trim().toLocaleLowerCase('ja-JP');
  const kind = $('card-kind-filter').value;
  const cards = getLibraryCards()
    .filter((card) => card.name.toLocaleLowerCase('ja-JP').includes(query))
    .filter((card) => kind === 'all' || card.kind === kind);
  if ($('card-sort').value === 'name') {
    cards.sort((a, b) => a.name.localeCompare(b.name, 'ja', { numeric: true }));
  }
  if (cards.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = '該当するカードがありません';
    list.append(empty);
    return;
  }
  cards.forEach((card) => {
    const item = button('', `library-item${card.id === state.selectedCardId ? ' active' : ''}`, () => {
      state.selectedCardId = card.id;
      renderCardLibrary();
      queueSave();
    });
    const name = document.createElement('span');
    name.className = 'library-name';
    name.textContent = card.name;
    const kindLabel = document.createElement('span');
    kindLabel.className = `kind-badge kind-${card.kind}`;
    kindLabel.textContent = CARD_KIND_LABELS[card.kind] ?? card.kind;
    item.title = card.name;
    item.append(name, kindLabel);
    list.append(item);
  });
}

function renderSelectedCardBar() {
  const bar = $('selected-card-bar');
  bar.textContent = '';
  const card = getCard(state.selectedCardId);
  if (!card) {
    bar.className = 'selected-card-bar empty muted';
    bar.textContent = 'カードを選択してください';
    return;
  }
  bar.className = 'selected-card-bar';
  const title = document.createElement('div');
  title.className = 'selected-card-title';
  title.textContent = card.name;
  const actions = document.createElement('div');
  actions.className = 'button-row';
  actions.append(
    button('編集', 'primary', () => showCardSubview('editor')),
    button('複製', '', () => duplicateCard(card)),
    button('削除', 'danger', () => deleteCard(card)),
  );
  bar.append(title, actions);
}

function showCardSubview(view) {
  cardEditorOpen = view === 'editor' && Boolean(getCard(state.selectedCardId));
  $('card-library-view').classList.toggle('active', !cardEditorOpen);
  $('card-editor-view').classList.toggle('active', cardEditorOpen);
  if (cardEditorOpen) renderCardEditor();
  else renderCardLibrary();
}

function renderCardEditor() {
  if (routeEditTarget) { renderRouteCardDialog(); return; }
  const editor = $('card-editor');
  editor.textContent = '';
  const card = getCard(state.selectedCardId);
  if (!card) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'カードを選択してください';
    editor.append(empty);
    return;
  }
  $('editing-card-name').textContent = card.name;

  const content = document.createElement('div');
  content.className = 'stack card-editor-content';
  const bar = document.createElement('div');
  bar.className = 'card-definition-bar';
  const title = document.createElement('strong');
  title.textContent = 'カード';
  const actions = document.createElement('div');
  actions.className = 'button-row';
  actions.append(
    button('複製', 'small', () => duplicateCard(card)),
    button('削除', 'small danger', () => deleteCard(card)),
  );
  const nameInput = document.createElement('input');
  nameInput.setAttribute('aria-label', 'カード名');
  nameInput.title = 'カード名';
  nameInput.value = card.name;
  nameInput.addEventListener('input', () => {
    card.name = nameInput.value;
    $('editing-card-name').textContent = card.name;
    renderCardLibrary();
    renderCarryInCards();
    renderRoutes();
    recalculate();
    queueSave();
  });
  const kindSelect = document.createElement('select');
  kindSelect.setAttribute('aria-label', 'カード種別');
  kindSelect.title = 'カード種別';
  [['active', 'アクティブ'], ['mental', 'メンタル'], ['drink', 'その他']]
    .forEach(([value, label]) => kindSelect.append(option(value, label, card.kind === value)));
  kindSelect.addEventListener('change', () => {
    card.kind = kindSelect.value;
    renderCardLibrary();
    recalculateAndSave();
  });
  bar.append(title, nameInput, kindSelect, actions);

  content.append(bar);
  content.append(RouteCardEditor.renderDefinition(card, EFFECT_TYPES, () => renderCardsAndRoutes(), renderEffectGroup));
  editor.append(content);
}

function duplicateCard(card) {
  const copy = structuredClone(card);
  copy.id = uuid();
  copy.name = `${card.name} コピー`;
  // Effect IDs are scoped to each card; retain them for modifier references.
  state.cards.push(copy);
  state.selectedCardId = copy.id;
  renderCardsAndRoutes();
}

function deleteCard(card) {
  if (!confirm(`「${card.name}」をカード倉庫から削除しますか？\nルート内の同カードも外れます。`)) return;
  state.cards = state.cards.filter((item) => item.id !== card.id);
  state.routes.forEach((route) => route.turns.forEach((turn) => {
    const kept = turn.cardIds.map((id, index) => ({ id, upgraded: Boolean(turn.upgraded[index]), config: turn.configs?.[index] }))
      .filter((entry) => entry.id !== card.id);
    turn.cardIds = kept.map((entry) => entry.id);
    turn.upgraded = kept.map((entry) => entry.upgraded);
    turn.configs = kept.map((entry) => entry.config);
  }));
  state.scenario.carryInCards = state.scenario.carryInCards.filter((item) => item.cardId !== card.id);
  state.selectedCardId = state.cards[0]?.id ?? null;
  cardEditorOpen = false;
  renderCardsAndRoutes();
  showCardSubview('library');
}

function effectTableHead() {
  const head = document.createElement('div');
  head.className = 'effect-table-head';
  ['効果', 'パラメータ', '回数', '集中倍率', '好調倍率', '操作'].forEach((text) => {
    const cell = document.createElement('span');
    cell.textContent = text;
    head.append(cell);
  });
  return head;
}

function renderEffectGroup(card, key, titleText, collapsible) {
  const group = document.createElement(collapsible ? 'details' : 'section');
  group.className = 'effect-group stack';
  if (collapsible) group.open = card[key].length > 0;
  const header = document.createElement(collapsible ? 'summary' : 'div');
  if (!collapsible) header.className = 'row between';
  const title = document.createElement(collapsible ? 'span' : 'h3');
  title.textContent = titleText;
  const addButton = button('＋追加', 'small', (event) => {
    event.preventDefault();
    event.stopPropagation();
    card[key].push(key === 'reservedEffects' ? makeReservedEffect() : makeEffect());
    renderCardEditor();
    recalculateAndSave();
  });
  header.append(title, addButton);
  group.append(header);
  if (card[key].length > 0) {
    group.append(effectTableHead());
    card[key].forEach((effect, index) => group.append(renderEffectRow(card, key, effect, index)));
  }
  return group;
}

function renderEffectRow(card, key, effect, index) {
  const reserved = key === 'reservedEffects';
  const scoreLike = effect.type === 'score' || effect.type === 'goodScore';
  const row = document.createElement('div');
  row.className = `effect-row effect-${effect.type}`;

  const typeSelect = document.createElement('select');
  typeSelect.setAttribute('aria-label', '効果');
  typeSelect.title = '効果';
  const known = EFFECT_TYPES.some((item) => item.value === effect.type);
  if (!known) typeSelect.append(option(effect.type, `未対応: ${effect.type}`, true));
  EFFECT_TYPES.forEach((item) => typeSelect.append(option(item.value, item.label, item.value === effect.type)));
  typeSelect.addEventListener('change', () => {
    effect.type = typeSelect.value;
    renderCardEditor();
    recalculateAndSave();
  });
  const valueInput = document.createElement('input');
  const valueLabel = effect.type === 'goodScore' ? '好調割合%' : (scoreLike ? 'パラメータ' : '効果量');
  valueInput.setAttribute('aria-label', valueLabel);
  valueInput.title = valueLabel;
  valueInput.type = 'number';
  valueInput.step = '1';
  valueInput.value = effect.value;
  valueInput.addEventListener('input', () => {
    effect.value = number(valueInput.value);
    recalculateAndSave();
  });
  let countCell;
  let concRateCell;
  let goodRateCell;
  if (scoreLike) {
    const countInput = document.createElement('input');
    countInput.setAttribute('aria-label', '回数');
    countInput.title = '回数';
    countInput.type = 'number';
    countInput.min = '0';
    countInput.step = '1';
    countInput.value = effect.count;
    countInput.addEventListener('input', () => {
      effect.count = clampInt(countInput.value, 0, 999, 0);
      recalculateAndSave();
    });
    countCell = countInput;

    const rateInput = document.createElement('input');
    rateInput.setAttribute('aria-label', '集中倍率');
    rateInput.title = '集中倍率';
    rateInput.type = 'number';
    rateInput.step = '1';
    rateInput.value = effect.concRate;
    rateInput.addEventListener('input', () => {
      effect.concRate = number(rateInput.value);
      recalculateAndSave();
    });
    concRateCell = rateInput;

    const goodRateInput = document.createElement('input');
    goodRateInput.setAttribute('aria-label', '好調倍率');
    goodRateInput.title = '好調倍率';
    goodRateInput.type = 'number';
    goodRateInput.step = '1';
    goodRateInput.value = effect.goodRate;
    goodRateInput.addEventListener('input', () => {
      effect.goodRate = number(goodRateInput.value, 1);
      recalculateAndSave();
    });
    goodRateCell = goodRateInput;
  } else {
    countCell = document.createElement('span');
    countCell.className = 'not-applicable';
    countCell.textContent = '—';
    concRateCell = countCell.cloneNode(true);
    goodRateCell = countCell.cloneNode(true);
  }

  const actions = document.createElement('div');
  actions.className = 'button-row effect-actions';
  const up = button('↑', 'small icon', () => moveArrayItem(card[key], index, index - 1, () => renderCardEditor()));
  up.disabled = index === 0;
  const down = button('↓', 'small icon', () => moveArrayItem(card[key], index, index + 1, () => renderCardEditor()));
  down.disabled = index === card[key].length - 1;
  actions.append(up, down, button('×', 'small icon danger', () => {
    card[key].splice(index, 1);
    renderCardEditor();
    recalculateAndSave();
  }));
  row.append(typeSelect, valueInput, countCell, concRateCell, goodRateCell, actions);

  if (reserved || effect.upgradeEnabled || effect.type === 'concScoreBoost') {
    const options = document.createElement('div');
    options.className = 'effect-options';
    const addNumberField = (labelText, property, minimum = null, integer = false) => {
      const label = document.createElement('label');
      label.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'number';
      if (minimum !== null) input.min = String(minimum);
      input.step = '1';
      input.value = effect[property];
      input.addEventListener('input', () => {
        effect[property] = integer
          ? clampInt(input.value, minimum ?? 1, 999, minimum ?? 1)
          : number(input.value);
        recalculateAndSave();
      });
      label.append(input);
      options.append(label);
    };
    if (effect.type === 'concScoreBoost') {
      effect.duration ??= 3;
      addNumberField('表示上の持続ターン', 'duration', 1, true);
      const thresholdLabel = document.createElement('label');
      thresholdLabel.textContent = '好調の上限条件（空欄で条件なし）';
      const threshold = document.createElement('input'); threshold.type = 'number'; threshold.min = '0';
      threshold.value = effect.goodThreshold ?? '';
      threshold.addEventListener('input', () => { effect.goodThreshold = threshold.value === '' ? null : Math.max(0, number(threshold.value)); recalculateAndSave(); });
      thresholdLabel.append(threshold); options.append(thresholdLabel);
    }
    if (reserved) {
      addNumberField('何ターン後', 'delay', 1, true);
      addNumberField('発動回数', 'repeat', 1, true);
      addNumberField('間隔', 'interval', 1, true);
    }
    if (effect.upgradeEnabled) {
      const upgradeValueLabel = effect.type === 'goodScore'
        ? '強化時 好調%'
        : (effect.type === 'score' ? '強化時 パラメータ' : '強化時 効果量');
      addNumberField(upgradeValueLabel, 'upgradeValue');
      if (scoreLike) {
        addNumberField('強化時 回数', 'upgradeCount', 1, true);
        addNumberField('強化時 集中倍率', 'upgradeConcRate');
        addNumberField('強化時 好調倍率', 'upgradeGoodRate');
      }
      if (reserved) {
        addNumberField('強化時 何T後', 'upgradeDelay', 1, true);
        addNumberField('強化時 発動回数', 'upgradeRepeat', 1, true);
        addNumberField('強化時 間隔', 'upgradeInterval', 1, true);
      }
    }
    row.append(options);
  }
  return row;
}

function moveArrayItem(array, from, to, rerender) {
  if (to < 0 || to >= array.length) return;
  [array[from], array[to]] = [array[to], array[from]];
  rerender();
  recalculateAndSave();
}

function renderCardsAndRoutes() {
  renderCardLibrary();
  renderCardEditor();
  renderCarryInCards();
  renderRoutes();
  recalculateAndSave();
}

function cardHasUpgrade(card) {
  if (!card) return false;
  return (card.variants?.plus?.length ?? 0) > 0;
}

function renderCarryInCards() {
  const list = $('carry-in-list');
  list.textContent = '';
  const available = state.cards.filter((card) => card.id !== 'route-drink:macchiato' && (card.reservedEffects.length > 0 || card.endTurnEffects?.length > 0));
  if (!state.scenario.carryInCards.some(entry => entry.cardId !== 'route-drink:macchiato')) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = '設定なし';
    list.append(empty);
    return;
  }
  state.scenario.carryInCards.forEach((entry, index) => {
    if (entry.cardId === 'route-drink:macchiato') return;
    const row = document.createElement('div');
    row.className = 'carry-in-item';
    const select = document.createElement('select');
    let current = getCard(entry.cardId);
    if (!current && available.length > 0) {
      entry.cardId = available[0].id;
      current = available[0];
    }
    if (current && !available.some((card) => card.id === current.id)) {
      select.append(option(current.id, `${current.name}（予約効果なし）`, true));
    }
    available.forEach((card) => select.append(option(card.id, card.name, card.id === entry.cardId)));
    select.addEventListener('change', () => {
      entry.cardId = select.value;
      entry.config = blankConfig();
      renderCarryInCards();
      recalculateAndSave();
    });

    const upgradeLabel = button('設定', 'small', () => openRouteCardDialog({ entry }));
    const usedLabel = document.createElement('label');
    usedLabel.className = 'carry-turn';
    usedLabel.textContent = '使用時 残り';
    const used = document.createElement('input');
    used.type = 'number';
    used.min = '1';
    used.max = '99';
    used.step = '1';
    used.value = entry.usedAtRemaining;
    used.addEventListener('input', () => {
      entry.usedAtRemaining = clampInt(used.value, 1, 99, state.scenario.remainingTurns + 1);
      recalculateAndSave();
    });
    usedLabel.append(used);
    const remove = button('×', 'small icon danger', () => {
      state.scenario.carryInCards.splice(index, 1);
      renderCarryInCards();
      recalculateAndSave();
    });
    row.append(select, upgradeLabel, usedLabel, remove);
    list.append(row);
  });
}

function addCarryInCard() {
  const card = state.cards.find((item) => item.id !== 'route-drink:macchiato' && (item.reservedEffects.length > 0 || item.endTurnEffects?.length > 0));
  if (!card) {
    setSaveStatus('予約効果を持つカードがありません');
    return;
  }
  state.scenario.carryInCards.push({
    id: uuid(),
    cardId: card.id,
    upgraded: false,
    config: blankConfig(),
    usedAtRemaining: Math.min(99, state.scenario.remainingTurns + 1),
  });
  renderCarryInCards();
  recalculateAndSave();
}

function setMacchiatoEnabled(enabled) {
  const id = 'route-drink:macchiato';
  if (!enabled) state.scenario.carryInCards = state.scenario.carryInCards.filter(entry => entry.cardId !== id);
  else if (!state.scenario.carryInCards.some(entry => entry.cardId === id)) {
    if (!getCard(id)) state.cards.push(RouteCardModel.makeCatalog().find(card => card.id === id));
    state.scenario.carryInCards.push({id:uuid(),cardId:id,config:{base:'base',custom:'',enhancement:''},upgraded:false,usedAtRemaining:Math.min(99,state.scenario.remainingTurns+1)});
  }
}

function renderExternalOrder() {
  const list = $('external-order');
  list.textContent = '';
  [...state.externalOrder, 'natsuya'].forEach((id, index) => {
    const effect = EXTERNAL_EFFECTS.find((item) => item.id === id);
    const setting = state.scenario[id];
    const row = document.createElement('div');
    row.className = 'effect-order-item';
    const numberNode = document.createElement('span');
    numberNode.className = 'muted';
    numberNode.textContent = index + 1;
    const enabledLabel = document.createElement('label');
    enabledLabel.className = 'check';
    const enabled = document.createElement('input');
    enabled.type = 'checkbox';
    enabled.checked = Boolean(setting?.enabled);
    enabled.addEventListener('change', () => {
      state.scenario[id].enabled = enabled.checked;
      recalculateAndSave();
    });
    enabledLabel.append(enabled, effect?.label ?? id);

    const settings = document.createElement('div');
    settings.className = 'effect-settings';
    if (id === 'entertainment') {
      const nationalLabel = document.createElement('label');
      const national = document.createElement('input');
      national.type = 'checkbox';
      national.checked = Boolean(setting.national);
      national.addEventListener('change', () => {
        state.scenario[id].national = national.checked;
        recalculateAndSave();
      });
      nationalLabel.append(national, '国民');

      const enhancedLabel = document.createElement('label');
      const enhanced = document.createElement('input');
      enhanced.type = 'checkbox';
      enhanced.checked = Boolean(setting.enhanced);
      enhanced.addEventListener('change', () => {
        state.scenario[id].enhanced = enhanced.checked;
        recalculateAndSave();
      });
      enhancedLabel.append(enhanced, '強化済み');
      settings.append(nationalLabel, enhancedLabel);
    }
    if (id === 'natsuya') {
      const remainingLabel = document.createElement('label');
      remainingLabel.textContent = '残り';
      const remaining = document.createElement('input');
      remaining.type = 'number';
      remaining.min = '1';
      remaining.step = '1';
      remaining.value = setting.remaining;
      remaining.addEventListener('input', () => {
        state.scenario[id].remaining = clampInt(remaining.value, 1, 999, 1);
        recalculateAndSave();
      });
      remainingLabel.append(remaining);
      settings.append(remainingLabel);
    }
    const up = button('↑', 'small icon', () => moveArrayItem(state.externalOrder, index, index - 1, renderExternalOrder));
    up.disabled = index === 0;
    const down = button('↓', 'small icon', () => moveArrayItem(state.externalOrder, index, index + 1, renderExternalOrder));
    down.disabled = index === state.externalOrder.length - 1;
    if (id === 'natsuya') row.append(enabledLabel, settings);
    else row.append(numberNode, enabledLabel, settings, up, down);
    list.append(row);
  });
  const tenshinLabel = document.createElement('label'); tenshinLabel.className = 'check';
  const tenshinInput = document.createElement('input'); tenshinInput.type = 'checkbox';
  tenshinInput.checked = state.scenario.tenshin.enabled;
  tenshinInput.addEventListener('change', () => { state.scenario.tenshin.enabled = tenshinInput.checked; recalculateAndSave(); });
  tenshinLabel.append(tenshinInput, '天真爛漫');
  const endTurnRow = document.createElement('div'); endTurnRow.className = 'row';
  const macchiatoLabel = document.createElement('label'); macchiatoLabel.className = 'check';
  const macchiatoInput = document.createElement('input'); macchiatoInput.type = 'checkbox';
  macchiatoInput.id = 'macchiato-enabled';
  macchiatoInput.checked = state.scenario.carryInCards.some(entry => entry.cardId === 'route-drink:macchiato');
  macchiatoInput.addEventListener('change', () => { setMacchiatoEnabled(macchiatoInput.checked); renderCarryInCards(); recalculateAndSave(); });
  macchiatoLabel.append(macchiatoInput, 'マキアート');
  endTurnRow.append(tenshinLabel, macchiatoLabel); list.append(endTurnRow);
  renderKyakkouSettings(list);
}

function renderRoutes() {
  $('route-name').disabled = !state.routes.length;
  $('duplicate-route').disabled = !state.routes.length;
  if (!getSelectedRoute()) state.selectedRouteId = state.routes[0]?.id;
  const library = $('route-library');
  library.textContent = '';
  state.routes.forEach((route) => {
    const item = document.createElement('div');
    item.className = `route-name-item${route.id === state.selectedRouteId ? ' active' : ''}`;
    item.dataset.routeId = route.id;
    item.tabIndex = 0;
    const name = document.createElement('span');
    name.textContent = route.name;
    const total = latestResults.find((result) => result.routeId === route.id)?.totalScore ?? 0;
    const score = document.createElement('span');
    score.className = 'score';
    score.textContent = fmt(total);
    const select = () => {
      state.selectedRouteId = route.id;
      renderRoutes();
      queueSave();
    };
    item.addEventListener('click', select);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') select();
    });
    item.append(name, score);
    library.append(item);
  });

  const route = getSelectedRoute();
  if (!route) {
    $('route-name').value = ''; $('turn-grid').textContent = '';
    $('route-total-preview').textContent = 'ルートがありません'; $('delete-route').disabled = true; return;
  }
  $('route-name').value = route.name;
  $('turn-grid').style.setProperty('--turn-count', route.turns.length);
  $('turn-grid').classList.toggle('single-turn', route.turns.length === 1);
  renderTurnGrid(route);
  const total = latestResults.find((result) => result.routeId === route.id)?.totalScore ?? 0;
  $('route-total-preview').textContent = `現在の合計 ${fmt(total)}`;
  $('delete-route').disabled = state.routes.length <= 1;
}

function renderTurnGrid(route) {
  const grid = $('turn-grid');
  grid.textContent = '';
  route.turns.forEach((turn, turnIndex) => {
    turn.upgraded = turn.cardIds.map((_, index) => Boolean(turn.upgraded?.[index]));
    turn.configs ??= [];
    const remaining = route.turns.length - turnIndex;
    const column = document.createElement('section');
    column.className = 'turn-column';
    const head = document.createElement('div');
    head.className = 'turn-head';
    const row = document.createElement('div');
    row.className = 'row between';
    const title = document.createElement('strong');
    title.textContent = `残り${remaining}ターン`;
    const attr = document.createElement('select');
    attr.style.width = '80px';
    ATTRIBUTES.forEach((id) => attr.append(option(id, ATTRIBUTE_LABELS[id], turn.attribute === id)));
    attr.addEventListener('change', () => {
      turn.attribute = attr.value;
      recalculateAndSave(true);
    });
    row.append(title, attr);
    const multiplier = document.createElement('div');
    multiplier.className = 'muted';
    multiplier.textContent = `倍率 ${fmt(state.scenario.multipliers[turn.attribute])}%`;
    head.append(row, multiplier);

    const addRow = document.createElement('div');
    addRow.className = 'turn-add';
    const cardSelect = document.createElement('select');
    if (getLibraryCards().length === 0) cardSelect.append(option('', 'カード倉庫が空です', true));
    getLibraryCards().forEach((card) => cardSelect.append(option(card.id, card.name)));
    const add = button('追加', 'small primary', () => {
      if (!cardSelect.value) return;
      turn.cardIds.push(cardSelect.value);
      turn.upgraded.push(false);
      turn.configs.push({ ...blankConfig(), ...(state.routeDefaults?.[cardSelect.value] ?? {}), enhancement: '' });
      renderRoutes();
      recalculateAndSave();
    });
    add.disabled = state.cards.length === 0;
    addRow.append(cardSelect, add);

    const cards = document.createElement('div');
    cards.className = 'turn-cards';
    if (turn.cardIds.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'カードなし';
      cards.append(empty);
    }
    turn.cardIds.forEach((cardId, index) => {
      const card = getCard(cardId);
      const step = document.createElement('div');
      step.className = 'card-step';
      const numberNode = document.createElement('span');
      numberNode.className = 'muted';
      numberNode.textContent = index + 1;
      const name = document.createElement('span');
      name.className = card ? 'card-step-name' : 'card-step-name error';
      name.textContent = resolveCard(card, turn.configs[index] ?? blankConfig())?.name ?? '削除済みカード';
      const upgradeCell = button('設定', 'small', () => openRouteCardDialog({ turn, index }));
      const remove = button('×', 'small icon danger', () => {
        turn.cardIds.splice(index, 1);
        turn.upgraded.splice(index, 1);
        turn.configs.splice(index, 1);
        renderRoutes();
        recalculateAndSave();
      });
      step.append(numberNode, name, upgradeCell, remove);
      cards.append(step);
    });
    column.append(head, addRow, cards);
    grid.append(column);
  });
}

function moveRouteCard(turn, from, to) {
  if (to < 0 || to >= turn.cardIds.length) return;
  [turn.cardIds[from], turn.cardIds[to]] = [turn.cardIds[to], turn.cardIds[from]];
  [turn.upgraded[from], turn.upgraded[to]] = [turn.upgraded[to], turn.upgraded[from]];
  [turn.configs[from], turn.configs[to]] = [turn.configs[to], turn.configs[from]];
  renderRoutes();
  recalculateAndSave();
}

function addRoute() {
  const route = makeRoute(`ルート${state.routes.length + 1}`, state.scenario.remainingTurns);
  state.routes.push(route);
  state.selectedRouteId = route.id;
  state.selectedResultRouteId = route.id;
  recalculateAndSave(true);
}

function duplicateRoute() {
  const source = getSelectedRoute();
  if (!source) return;
  const route = structuredClone(source);
  route.id = uuid();
  route.name = `${source.name} コピー`;
  state.routes.push(route);
  state.selectedRouteId = route.id;
  state.selectedResultRouteId = route.id;
  recalculateAndSave(true);
}

function deleteRoute() {
  const route = getSelectedRoute();
  if (!route || state.routes.length <= 1) return;
  if (!confirm(`「${route.name}」を削除しますか？`)) return;
  state.routes = state.routes.filter((item) => item.id !== route.id);
  state.selectedRouteId = state.routes[0]?.id;
  if (state.selectedResultRouteId === route.id) state.selectedResultRouteId = state.routes[0]?.id;
  recalculateAndSave(true);
}

function buildCalcState() {
  const s = state.scenario;
  const timedConcGainBoost = s.concGainBoostTurns > 0 ? s.concGainBoost / 100 : 0;
  const concScoreBuffs = [];
  for (const row of normalizeConcScoreRows(s)) {
    if (row.percent <= 0 || row.turns <= 0) continue;
    const sameTurn = row.fresh && concScoreBuffs.find(buff => buff.fresh && buff.remaining === row.turns);
    if (sameTurn) sameTurn.value += row.percent / 100;
    else concScoreBuffs.push({ value: row.percent / 100, remaining: row.turns, fresh: row.fresh });
  }
  shareConcScoreBuffPeriods(concScoreBuffs);
  return {
    concentration: s.concentration,
    good: s.good,
    paramBoost: s.paramBoost / 100,
    goodGainBoost: s.goodGainBoostTurns > 0 ? s.goodGainBoost / 100 : 0,
    goodGainBoostRemaining: Math.max(0, Math.floor(s.goodGainBoostTurns)),
    goodGainBoostFresh: Boolean(s.goodGainBoostFresh),
    concGainBoost: timedConcGainBoost,
    timedConcGainBoost,
    concGainBoostRemaining: Math.max(0, Math.floor(s.concGainBoostTurns)),
    concGainBoostFresh: Boolean(s.concGainBoostFresh),
    concScoreBoost: concScoreBuffs.reduce((sum, buff) => sum + buff.value, 0),
    concScoreBuffs,
    turnMultiplier: 1,
    superGood: s.superGood,
    score: 0,
    natsuyaRemaining: Math.max(1, Math.floor(s.natsuya.remaining)),
    kyakkouCount: s.kyakkou.count,
  };
}

function getGoodMultiplier(calc, goodRate = 1) {
  if (calc.good <= 0) return 1;
  // Keep the coefficient in double precision; calculateScore rounds the product to float32.
  if (!calc.superGood) return 1 + 0.5 * goodRate;
  return 1 + (0.5 + calc.good * 0.1) * goodRate;
}

function calculateScore(calc, base, options = {}) {
  const concRate = options.concRate ?? 1;
  // Common float32 model verified against the accepted vovi route and observed route-share hits.
  // Keep basic concentration and its additional multiplier contribution separate.
  const buffs = Array.isArray(calc.concScoreBuffs) ? calc.concScoreBuffs : [{value:calc.concScoreBoost??0}];
  const factor = buffs.reduce((sum,buff)=>Math.fround(sum+Math.fround(buff.value)),Math.fround(1));
  const basic = Math.fround(Math.fround(calc.concentration)*factor);
  const extra = Math.fround(Math.fround(Math.fround(calc.concentration)*Math.fround(concRate-1))*factor);
  const step1 = Math.ceil(base)+Math.ceil(basic)+Math.ceil(extra);
  // Empirical float32 stages also reproduce the observed integer-boundary Kyakkou scores.
  const goodAdjusted = Math.fround(step1 * getGoodMultiplier(calc, options.goodRate ?? 1));
  const stanceAdjusted = options.stanceMultiplier === undefined
    ? goodAdjusted : Math.fround(goodAdjusted * options.stanceMultiplier);
  const step2 = Math.ceil(Math.fround(stanceAdjusted * Math.fround(1 + calc.paramBoost)));
  const result = ceilScore(step2 * calc.turnMultiplier);
  return { base, concRate, step1, step2, result };
}

function addScore(calc, events, base, options = {}) {
  const count = Math.max(1, Math.floor(options.count ?? 1));
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    const detail = calculateScore(calc, base, options);
    calc.score += detail.result;
    total += detail.result;
    events.push(`${options.source ?? 'パラメータ'}: P+${fmt(base, 2)} / 集中効果${fmt(detail.concRate, 2)} → +${fmt(detail.result)}`);
  }
  return total;
}

function addConcentration(calc, events, rawValue, source) {
  const boosted = ceilScore(rawValue * (1 + calc.concGainBoost));
  calc.concentration += boosted;
  events.push(`${source}: 集中 ${signed(rawValue)} → 補正後 +${fmt(boosted, 2)}`);
}

function resolveEffect(effect, upgraded = false) {
  if (!upgraded || !effect.upgradeEnabled) return effect;
  return {
    ...effect,
    value: effect.upgradeValue,
    count: effect.upgradeCount,
    concRate: effect.upgradeConcRate,
    goodRate: effect.upgradeGoodRate,
    delay: effect.upgradeDelay ?? effect.delay,
    repeat: effect.upgradeRepeat ?? effect.repeat,
    interval: effect.upgradeInterval ?? effect.interval,
  };
}

function applyEffect(calc, card, rawEffect, events, upgraded = false, sourceSuffix = '') {
  const effect = resolveEffect(rawEffect, upgraded);
  if (effect.count === 0) return;
  const value = number(effect.value);
  const source = `${card.name}${sourceSuffix}`;
  switch (effect.type) {
    case 'score':
      addScore(calc, events, value, {
        source, count: effect.count, concRate: number(effect.concRate, 1), goodRate: number(effect.goodRate, 1),
      });
      break;
    case 'goodScore':
      addScore(calc, events, calc.good * value / 100, {
        source: `${source}（好調${fmt(value, 2)}%）`,
        count: effect.count,
        concRate: number(effect.concRate, 1),
        goodRate: number(effect.goodRate, 1),
      });
      break;
    case 'concentration':
      if (value < 0 && !card.legacySnapshot) {
        calc.concentration = Math.max(0, calc.concentration + value);
        events.push(`${source}: 集中消費 ${-value} → ${fmt(calc.concentration)}`);
      } else addConcentration(calc, events, value, source);
      break;
    case 'good': {
      const gained = value > 0 ? ceilScore(value * (1 + (calc.goodGainBoost ?? 0))) : value;
      if (calc.good === 0 && gained > 0) calc.goodFresh = true;
      calc.good = Math.max(0, calc.good + gained);
      events.push(`${source}: 好調 ${signed(value)}${gained !== value ? ` → 補正後 ${signed(gained)}` : ''} → ${fmt(calc.good, 2)}`);
      break;
    }
    case 'paramBoost':
      calc.paramBoost += value / 100;
      events.push(`${source}: パラメータ上昇量増加 ${signed(value, '%')} → ${fmt(calc.paramBoost * 100, 2)}%`);
      break;
    case 'concGainBoost':
      calc.concGainBoost += value / 100;
      events.push(`${source}: 集中増加量増加 ${signed(value, '%')} → ${fmt(calc.concGainBoost * 100, 2)}%`);
      break;
    case 'concScoreBoost':
      if (effect.goodThreshold != null && calc.good > number(effect.goodThreshold)) {
        events.push(`${source}: 好調${effect.goodThreshold}以下の条件を満たさないため集中強化なし`);
        break;
      }
      addConcScoreBuff(calc, value / 100, clampInt(effect.duration, 1, 99, 3));
      events.push(`${source}: 集中強化 ${signed(value, '%')}（表示${effect.duration ?? 3}ターン） → ${concScoreBuffText(calc.concScoreBuffs)}`);
      break;
    default:
      events.push(`未対応の効果: ${effect.type}`);
  }
}

function applyNatsuya(calc, events) {
  const setting = state.scenario.natsuya;
  if (!setting.enabled) return;
  calc.natsuyaRemaining -= 1;
  events.push(`夏夜カウント: 残り${calc.natsuyaRemaining}`);
  if (calc.natsuyaRemaining <= 0) {
    addScore(calc, events, 4, { source: '夏夜追撃', concRate: 1 });
    calc.natsuyaRemaining = 5;
    events.push(`夏夜カウント: ${calc.natsuyaRemaining}に戻る`);
  }
}

function applyExternalEffect(id, calc, card, events) {
  const s = state.scenario;
  const isSkill = card.kind === 'active' || card.kind === 'mental';
  if (id === 'negai' && card.kind === 'active' && s.negai.enabled) {
    addConcentration(calc, events, 1, '願いの力');
  } else if (id === 'entertainment' && card.kind === 'active' && s.entertainment.enabled) {
    addScore(calc, events, s.entertainment.enhanced ? 5 : 4, {
      source: '至高のエンタメ',
      count: s.entertainment.national ? 2 : 1,
      concRate: 1,
    });
  } else if (id === 'natsuya' && isSkill) {
    applyNatsuya(calc, events);
  }
}

function scheduleReservedEffects(queue, card, usedAtRemaining, upgraded, routeStartRemaining, warnings) {
  let outsideAfterRoute = 0;
  card.reservedEffects.forEach((rawEffect) => {
    const effect = resolveEffect(rawEffect, upgraded);
    if (effect.count === 0) return;
    const delay = clampInt(effect.delay, 1, 99, 1);
    const repeat = clampInt(effect.repeat, 1, 99, 1);
    const interval = clampInt(effect.interval, 1, 99, 1);
    for (let index = 0; index < repeat; index += 1) {
      const targetRemaining = usedAtRemaining - delay - index * interval;
      if (targetRemaining > routeStartRemaining) continue;
      if (targetRemaining < 1) {
        outsideAfterRoute += 1;
        continue;
      }
      if (!queue.has(targetRemaining)) queue.set(targetRemaining, []);
      queue.get(targetRemaining).push({ card, effect: structuredClone(effect) });
    }
  });
  if (outsideAfterRoute > 0) {
    warnings.push(`${card.name}: ルート終了後に発動する予約が${outsideAfterRoute}回あります。`);
  }
}

function simulateRoute(route) {
  const calc = buildCalcState();
  const warnings = [];
  const turns = [];
  const reservedQueue = new Map();
  state.scenario.carryInCards.forEach((entry) => {
    const card = resolveCard(getCard(entry.cardId), entry.config ?? { base: entry.upgraded ? 'plus' : 'base' });
    if (!card) {
      warnings.push('開始前使用カードに削除済みのカードがあります。');
      return;
    }
    if (card.reservedEffects.length === 0 && !card.endTurnEffects?.length) {
      warnings.push(`${card.name}: 予約効果が定義されていません。`);
      return;
    }
    scheduleReservedEffects(
      reservedQueue,
      card,
      clampInt(entry.usedAtRemaining, 1, 99, state.scenario.remainingTurns + 1),
      false,
      route.turns.length,
      warnings,
    );
  });
  route.turns.forEach((turn, turnIndex) => {
    calc.goodFresh = false;
    const remaining = route.turns.length - turnIndex;
    calc.turnMultiplier = state.scenario.multipliers[turn.attribute] / 100;
    const turnStartScore = calc.score;
    const startEvents = [];
    const beforeReservedScore = calc.score;
    (reservedQueue.get(remaining) ?? []).forEach((entry) => {
      applyEffect(calc, entry.card, entry.effect, startEvents, false, '（予約）');
    });
    reservedQueue.delete(remaining);
    const startScore = calc.score - beforeReservedScore;
    const startState = {
      concScoreBoost: calc.concScoreBoost,
      concScoreBuffs: structuredClone(calc.concScoreBuffs),
      cumulativeScore: calc.score,
      concentration: calc.concentration,
      good: calc.good,
      kyakkouCount: calc.kyakkouCount,
    };
    const cards = [];
    turn.cardIds.forEach((cardId, cardIndex) => {
      const card = resolveCard(getCard(cardId), turn.configs?.[cardIndex] ?? { base: turn.upgraded?.[cardIndex] ? 'plus' : 'base' });
      if (!card) {
        warnings.push(`残り${remaining}ターン ${cardIndex + 1}枚目が削除済みです。`);
        return;
      }
      const upgraded = false;
      if (card.unconfigured) warnings.push(`${card.name}: 追加強化が未設定です。`);
      const beforeScore = calc.score;
      const events = [];
      card.preEffects.forEach((effect) => applyEffect(calc, card, effect, events, upgraded));
      state.externalOrder.filter((id) => id !== 'natsuya').forEach((id) => applyExternalEffect(id, calc, card, events));
      applyExternalEffect('natsuya', calc, card, events);
      card.effects.forEach((effect) => applyEffect(calc, card, effect, events, upgraded));
      scheduleReservedEffects(reservedQueue, card, remaining, upgraded, route.turns.length, warnings);
      applyKyakkou(calc, card, events);
      cards.push({
        index: cardIndex + 1,
        name: `${card.name}${upgraded ? '（強化）' : ''}`,
        upgraded,
        deltaScore: calc.score - beforeScore,
        cumulativeScore: calc.score,
        concentration: calc.concentration,
        good: calc.good,
        paramBoost: calc.paramBoost,
        concGainBoost: calc.concGainBoost,
        concScoreBoost: calc.concScoreBoost,
        concScoreBuffs: structuredClone(calc.concScoreBuffs),
        kyakkouCount: calc.kyakkouCount,
        events,
      });
    });
    const endEvents = [];
    for (const entry of state.scenario.carryInCards) {
      if (remaining > entry.usedAtRemaining) continue;
      const usedCard = resolveCard(getCard(entry.cardId), entry.config ?? {base:'base'});
      for (const effect of usedCard?.endTurnEffects ?? []) {
        applyEffect(calc, usedCard, effect, endEvents, false);
      }
    }
    if (state.scenario.tenshin.enabled && calc.concentration >= 3) {
      addConcentration(calc, endEvents, 2, '天真爛漫');
    }
    endConcScoreBuffTurn(calc);
    const goodBeforeEnd = calc.good;
    if (!calc.goodFresh) calc.good = Math.max(0, calc.good - 1);
    endInitialGainBoostTurn(calc);
    startEvents.unshift(`開始時の集中強化: ${concScoreBuffText(startState.concScoreBuffs)}`);
    turns.push({
      index: turnIndex + 1,
      remaining,
      attribute: turn.attribute,
      multiplier: state.scenario.multipliers[turn.attribute],
      score: calc.score - turnStartScore,
      cumulativeScore: calc.score,
      startScore,
      startEvents,
      startState,
      cards,
      endEvents,
      endState: {
        kyakkouCount: calc.kyakkouCount,
        concentration: calc.concentration,
        good: calc.good,
        goodBeforeEnd,
        goodGainBoost: calc.goodGainBoost,
        goodGainBoostRemaining: calc.goodGainBoostRemaining,
        concGainBoostRemaining: calc.concGainBoostRemaining,
        paramBoost: calc.paramBoost,
        concGainBoost: calc.concGainBoost,
        concScoreBoost: calc.concScoreBoost,
        concScoreBuffs: structuredClone(calc.concScoreBuffs),
      },
    });
  });
  return {
    routeId: route.id,
    name: route.name,
    totalScore: calc.score,
    finalState: {
      kyakkouCount: calc.kyakkouCount,
      concentration: calc.concentration,
      good: calc.good,
      paramBoost: calc.paramBoost,
      concGainBoost: calc.concGainBoost,
      concScoreBoost: calc.concScoreBoost,
    },
    turns,
    warnings,
  };
}

function recalculateAndSave(renderRouteToo = false) {
  recalculate(renderRouteToo);
  queueSave();
}

function recalculate(renderRouteToo = false) {
  latestResults = state.routes.map(simulateRoute);
  renderResults();
  if (renderRouteToo) renderRoutes();
  else updateRouteScores();
}

function updateRouteScores() {
  document.querySelectorAll('.route-name-item').forEach((item) => {
    const result = latestResults.find((entry) => entry.routeId === item.dataset.routeId);
    const score = item.querySelector('.score');
    if (score) score.textContent = fmt(result?.totalScore ?? 0);
  });
  const selected = getSelectedRoute();
  if (selected) {
    const result = latestResults.find((entry) => entry.routeId === selected.id);
    $('route-total-preview').textContent = `現在の合計 ${fmt(result?.totalScore ?? 0)}`;
  }
}

function displayedTotal(result) {
  return result.totalScore + (state.scenario.showFinalScore ? state.scenario.previousScore : 0);
}

function renderResults() {
  $('show-final-score').checked = state.scenario.showFinalScore;
  renderRanking();
  renderResultDetail();
}

function renderRanking() {
  const container = $('ranking');
  container.textContent = '';
  if (latestResults.length === 0) {
    container.textContent = 'ルートがありません';
    return;
  }
  const sorted = [...latestResults].sort((a, b) => b.totalScore - a.totalScore);
  const highlightBest = sorted.length > 1;
  const bestTurns = Array.from({ length: state.scenario.remainingTurns }, (_, turnIndex) => (
    Math.max(...sorted.map((result) => result.turns[turnIndex]?.score ?? 0))
  ));
  const bestTotal = Math.max(...sorted.map((result) => result.totalScore));
  const table = document.createElement('table');
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['順位', 'ルート', ...Array.from({ length: state.scenario.remainingTurns }, (_, index) => `${state.scenario.remainingTurns - index}T`), '合計', '最終集中', '最終好調']
    .forEach((text) => {
      const th = document.createElement('th');
      th.textContent = text;
      headRow.append(th);
    });
  head.append(headRow);
  const body = document.createElement('tbody');
  sorted.forEach((result, index) => {
    const row = document.createElement('tr');
    row.className = `selectable${result.routeId === state.selectedResultRouteId ? ' selected' : ''}${index === 0 ? ' rank-1' : ''}`;
    row.addEventListener('click', () => {
      state.selectedResultRouteId = result.routeId;
      renderResults();
      queueSave();
    });
    const values = [index + 1, result.name, ...result.turns.map((turn) => fmt(turn.score)), fmt(displayedTotal(result)), fmt(result.finalState.concentration, 2), fmt(result.finalState.good, 2)];
    values.forEach((value, cellIndex) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      const turnIndex = cellIndex - 2;
      if (highlightBest && turnIndex >= 0 && turnIndex < result.turns.length && result.turns[turnIndex].score === bestTurns[turnIndex]) {
        cell.classList.add('best-score');
      }
      const totalIndex = 2 + result.turns.length;
      if (highlightBest && cellIndex === totalIndex && result.totalScore === bestTotal) {
        cell.classList.add('best-score');
      }
      row.append(cell);
    });
    body.append(row);
  });
  table.append(head, body);
  container.append(table);
}

function metric(label, value) {
  const box = document.createElement('div');
  box.className = 'metric';
  const labelNode = document.createElement('div');
  labelNode.className = 'muted';
  labelNode.textContent = label;
  const valueNode = document.createElement('div');
  valueNode.className = 'metric-value';
  valueNode.textContent = value;
  box.append(labelNode, valueNode);
  return box;
}

function renderResultDetail() {
  let result = latestResults.find((item) => item.routeId === state.selectedResultRouteId);
  if (!result) {
    result = latestResults[0];
    state.selectedResultRouteId = result?.routeId ?? null;
  }
  const summary = $('result-summary');
  const detail = $('result-detail');
  summary.textContent = '';
  detail.textContent = '';
  if (!result) return;
  $('result-title').textContent = `${result.name} の詳細`;
  summary.append(
    metric(state.scenario.showFinalScore ? '最終スコア' : '合計スコア', fmt(displayedTotal(result))),
    metric('最終集中', fmt(result.finalState.concentration, 2)),
    metric('最終好調', fmt(result.finalState.good, 2)),
    metric('パラメータ上昇量', `${fmt(result.finalState.paramBoost * 100, 2)}%`),
  );
  result.warnings.forEach((warning) => {
    const node = document.createElement('p');
    node.className = 'note error';
    node.textContent = warning;
    detail.append(node);
  });
  result.turns.forEach((turn) => detail.append(renderTurnResult(turn)));
}

function renderTurnResult(turn) {
  const box = document.createElement('details');
  box.className = 'turn-result';
  box.open = true;
  const summary = document.createElement('summary');
  summary.textContent = `残り${turn.remaining}ターン・${ATTRIBUTE_LABELS[turn.attribute]} ${fmt(turn.multiplier)}%　${fmt(turn.score)}（累計 ${fmt(turn.cumulativeScore)}）`;
  const body = document.createElement('div');
  body.className = 'turn-result-body';
  if (turn.cards.length === 0 && turn.startEvents.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'カードなし';
    body.append(empty);
  } else {
    const table = document.createElement('table');
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['#', 'カード', '使用スコア', '累計', '集中', '好調'].forEach((text) => {
      const th = document.createElement('th');
      th.textContent = text;
      headRow.append(th);
    });
    head.append(headRow);
    const tbody = document.createElement('tbody');
    if (turn.startEvents.length > 0) {
      const startRow = document.createElement('tr');
      ['—', 'ターン開始時予約', fmt(turn.startScore), fmt(turn.startState.cumulativeScore), fmt(turn.startState.concentration, 2), fmt(turn.startState.good, 2)]
        .forEach((value) => {
          const td = document.createElement('td');
          td.textContent = value;
          startRow.append(td);
        });
      tbody.append(startRow);
      if (state.logDetail) {
        const logRow = document.createElement('tr');
        const logCell = document.createElement('td');
        logCell.colSpan = 6;
        const list = document.createElement('ul');
        list.className = 'events';
        turn.startEvents.forEach((event) => {
          const item = document.createElement('li');
          item.textContent = event;
          list.append(item);
        });
        logCell.append(list);
        logRow.append(logCell);
        tbody.append(logRow);
      }
    }
    turn.cards.forEach((card) => {
      const row = document.createElement('tr');
      [card.index, card.name, fmt(card.deltaScore), fmt(card.cumulativeScore), fmt(card.concentration, 2), fmt(card.good, 2)]
        .forEach((value) => {
          const td = document.createElement('td');
          td.textContent = value;
          row.append(td);
        });
      tbody.append(row);
      if (state.logDetail) {
        const logRow = document.createElement('tr');
        const logCell = document.createElement('td');
        logCell.colSpan = 6;
        const list = document.createElement('ul');
        list.className = 'events';
        (card.events.length ? card.events : ['効果なし']).forEach((event) => {
          const item = document.createElement('li');
          item.textContent = event;
          list.append(item);
        });
        logCell.append(list);
        logRow.append(logCell);
        tbody.append(logRow);
      }
    });
    table.append(head, tbody);
    body.append(table);
  }
  const end = document.createElement('p');
  end.className = 'muted';
  end.style.marginTop = '6px';
  end.textContent = (turn.endEvents?.length ? turn.endEvents.join(' / ') + ' / ' : '') + `ターン終了: 集中 ${fmt(turn.endState.concentration, 2)} / 好調 ${fmt(turn.endState.goodBeforeEnd, 2)} → ${fmt(turn.endState.good, 2)} / 集中増加量 ${fmt(turn.endState.concGainBoost * 100, 2)}%（残り${turn.endState.concGainBoostRemaining}T） / 好調増加量 ${fmt((turn.endState.goodGainBoost ?? 0) * 100, 2)}%（残り${turn.endState.goodGainBoostRemaining ?? 0}T） / 脚光カウント ${turn.endState.kyakkouCount} / 集中強化（次ターン） ${concScoreBuffText(turn.endState.concScoreBuffs)} / パラメータ上昇量 ${fmt(turn.endState.paramBoost * 100, 2)}%`;
  body.append(end);
  box.append(summary, body);
  return box;
}

function renderAll() {
  renderCardLibrary();
  renderCardEditor();
  renderExternalOrder();
  renderCarryInCards();
  renderScenePresets();
  recalculate();
  renderRoutes();
  showCardSubview(cardEditorOpen ? 'editor' : 'library');
  showStep(state.activeStep);
}

function bindEvents() {
  $('show-final-score').addEventListener('change', () => {
    state.scenario.showFinalScore = $('show-final-score').checked;
    renderResults();
    queueSave();
  });
  document.querySelectorAll('[data-step]').forEach((step) => {
    step.addEventListener('click', () => showStep(Number(step.dataset.step)));
  });
  $('previous-step').addEventListener('click', () => showStep(state.activeStep - 1));
  $('next-step').addEventListener('click', () => showStep(state.activeStep + 1));
  $('save-now').addEventListener('click', () => saveNow());
  $('card-search').addEventListener('input', renderCardLibrary);
  $('card-kind-filter').addEventListener('change', renderCardLibrary);
  $('card-sort').addEventListener('change', renderCardLibrary);
  $('back-card-library').addEventListener('click', () => showCardSubview('library'));
  $('add-card').addEventListener('click', () => {
    const card = {
      id: uuid(), name: '新規カード', kind: 'active', ljReaction: false,
      preEffects: [], effects: [makeEffect()], reservedEffects: [],
    };
    state.cards.push(card);
    state.selectedCardId = card.id;
    renderCardsAndRoutes();
    showCardSubview('editor');
  });

  SCENARIO_INPUT_IDS.forEach((id) => {
    const input = $(id);
    const update = () => {
      readScenarioFromInputs();
      if (id === 'remaining-turns') renderRoutes();
      recalculate();
      queueSave();
    };
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });

  $('scene-preset-select').addEventListener('change', () => {
    state.selectedScenePresetId = $('scene-preset-select').value;
    renderScenePresets();
    queueSave();
  });
  $('load-scene-preset').addEventListener('click', loadScenePreset);
  $('save-scene-preset').addEventListener('click', saveNewScenePreset);
  $('overwrite-scene-preset').addEventListener('click', overwriteScenePreset);
  $('delete-scene-preset').addEventListener('click', deleteScenePreset);
  $('add-carry-in').addEventListener('click', addCarryInCard);

  $('add-route').addEventListener('click', addRoute);
  $('duplicate-route').addEventListener('click', duplicateRoute);
  $('delete-route').addEventListener('click', deleteRoute);
  $('route-name').addEventListener('input', () => {
    const route = getSelectedRoute();
    if (!route) return;
    route.name = $('route-name').value;
    recalculate();
    renderRoutes();
    queueSave();
  });
  $('recalculate').addEventListener('click', () => recalculate(true));
  $('log-detail').addEventListener('change', () => {
    state.logDetail = $('log-detail').checked;
    renderResultDetail();
    queueSave();
  });

  const dialog = $('data-dialog');
  $('open-data').addEventListener('click', () => dialog.showModal());
  $('close-data').addEventListener('click', () => dialog.close());
  ['export-route', 'share-edit-route', 'share-result-route'].forEach(id => $(id).addEventListener('click', exportSelectedRoute));
  $('export-json').addEventListener('click', async () => {
    const json = JSON.stringify(collectSaveData(), null, 2);
    $('save-json').value = json;
    try {
      await navigator.clipboard.writeText(json);
      setSaveStatus('JSONを書き出してコピーしました');
    } catch {
      setSaveStatus('JSONを書き出しました');
    }
  });
  $('export-cards').addEventListener('click', async () => {
    $('save-json').value = JSON.stringify({ version: 8, plan: collectSaveData().plan, kind: 'card-definitions', cards: state.cards }, null, 2);
    try { await navigator.clipboard.writeText($('save-json').value); } catch {}
    setSaveStatus('カード定義を書き出しました');
  });
  $('import-cards').addEventListener('click', () => {
    try {
      const data = JSON.parse($('save-json').value);
      if (!Array.isArray(data.cards)) throw new Error('カード定義がありません');
      const imported = migrateSavedData({ ...data, scenario: defaultScenario(), routes: [] }).cards;
      for (const card of imported) {
        const previous = state.cards.find(c => c.id === card.id || c.name === card.name);
        if (!previous) { state.cards.push(card); continue; }
        preserveMissingConfigurations(previous, card);
        card.id = previous.id;
        state.cards[state.cards.indexOf(previous)] = card;
      }
      renderAll(); saveNow('カード定義を読み込みました'); dialog.close();
    } catch (error) { setSaveStatus('読込失敗: ' + error.message); }
  });
  $('import-json').addEventListener('click', () => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) localStorage.setItem(IMPORT_BACKUP_KEY, current);
      restoreState(JSON.parse($('save-json').value));
      saveNow('JSONを読み込みました');
      dialog.close();
    } catch (error) {
      setSaveStatus(`JSON読込失敗: ${error.message}`);
    }
  });
  $('reset-storage').addEventListener('click', () => {
    if (!confirm('保存データを初期値に戻しますか？')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = makeDefaultState();
    applyScenarioToInputs();
    $('log-detail').checked = false;
    renderAll();
    saveNow('初期値に戻しました');
    dialog.close();
  });
}

function slotConfig(turn, index) {
  turn.configs ??= [];
  return turn.configs[index] ??= blankConfig();
}

function migrateSavedDataWithLegacy(data) {
  const result = readSavedData(data);
  if (!result.cards.some(card => card.name === '精神統一')) result.cards.push(RouteCardModel.makeCatalog().find(card => card.name === '精神統一'));
  if (Number(data.version) >= 5) {
    result.cards.forEach(ensureVariants);
    return result;
  }
  const oldCards = result.cards;
  const migrated = RouteCardModel.migrateLegacy(oldCards, oldCards.map(c => c.id));
  const byId = new Map(oldCards.map((card, index) => [card.id, migrated.route[index]]));
  result.cards = migrated.cards;
  const convert = (id, upgraded) => {
    const entry = byId.get(id);
    return entry ? { ...entry, base: upgraded ? 'plus' : 'base' } : { cardId: id, ...blankConfig() };
  };
  result.routes.forEach(route => route.turns.forEach(turn => {
    const entries = turn.cardIds.map((id, index) => convert(id, turn.upgraded[index]));
    turn.cardIds = entries.map(entry => entry.cardId);
    turn.configs = entries;
  }));
  const convertScenario = scenario => {
    for (const entry of scenario.carryInCards) {
      entry.config = convert(entry.cardId, entry.upgraded);
      entry.cardId = entry.config.cardId;
    }
  };
  convertScenario(result.scenario);
  result.scenePresets.forEach(preset => convertScenario(preset.scenario));
  result.selectedCardId = byId.get(result.selectedCardId)?.cardId ?? result.cards[0]?.id;
  return result;
}

function openRouteCardDialog(target) {
  routeEditTarget = target;
  renderRouteCardDialog();
  $('route-card-dialog').showModal();
}

function renderRouteCardDialog() {
  if (!routeEditTarget) return;
  const { entry, turn, index } = routeEditTarget;
  const cardId = entry ? entry.cardId : turn.cardIds[index];
  const card = getCard(cardId);
  const config = entry ? (entry.config ??= blankConfig()) : slotConfig(turn, index);
  $('route-card-title').textContent = `${card?.name ?? 'カード'} の設定`;
  const container = $('route-card-content');
  container.textContent = '';
  if (!card) return;
  container.append(RouteCardEditor.renderConfiguration(card, config, () => {
    renderRouteCardDialog(); renderRoutes(); renderCarryInCards(); recalculateAndSave();
  }, renderEffectGroup, EFFECT_TYPES));
}

function preserveMissingConfigurations(previous, imported) {
  const keep = config => {
    if (!config || config.override) return;
    if ((config.custom && !imported.variants.customs.some(v => v.id === config.custom)) ||
        (config.enhancement && !imported.variants.enhancements.some(v => v.id === config.enhancement))) {
      const resolved = resolveCard(previous, config);
      config.override = { preEffects: resolved.preEffects, effects: resolved.effects, reservedEffects: resolved.reservedEffects, kind: resolved.kind, ljReaction: resolved.ljReaction };
      config.custom = ''; config.enhancement = '';
    }
  };
  state.routes.forEach(route => route.turns.forEach(turn => turn.cardIds.forEach((id, index) => {
    if (id === previous.id) keep(slotConfig(turn, index));
  })));
  [state.scenario, ...state.scenePresets.map(p => p.scenario)].forEach(scenario => scenario.carryInCards.forEach(entry => {
    if (entry.cardId === previous.id) keep(entry.config);
  }));
}

$('close-route-card').addEventListener('click', () => $('route-card-dialog').close());
$('route-card-dialog').addEventListener('close', () => {
  routeEditTarget = null;
  renderRoutes(); recalculateAndSave();
});

bindEvents();
if (!loadSavedData()) {
  applyScenarioToInputs();
  renderAll();
}

// Merge equal-duration grants within the current turn; keep prior-turn grants separate.
function shareConcScoreBuffPeriods(buffs) {
  const agingDurations = new Set(buffs.filter(buff => !buff.fresh).map(buff => buff.remaining));
  for (const buff of buffs) {
    if (buff.fresh && agingDurations.has(buff.remaining)) buff.ageThisTurn = true;
  }
}
function addConcScoreBuff(calc, value, duration) {
  const sameTurn = calc.concScoreBuffs.find(buff => buff.fresh && buff.remaining === duration);
  if (sameTurn) sameTurn.value += value;
  else calc.concScoreBuffs.push({ value, remaining: duration, fresh: true });
  shareConcScoreBuffPeriods(calc.concScoreBuffs);
  calc.concScoreBoost = calc.concScoreBuffs.reduce((sum, buff) => sum + buff.value, 0);
}
function endConcScoreBuffTurn(calc) {
  for (const buff of calc.concScoreBuffs) {
    if (!buff.fresh || buff.ageThisTurn) buff.remaining -= 1;
    delete buff.ageThisTurn;
    buff.fresh = false;
  }
  calc.concScoreBuffs = calc.concScoreBuffs.filter(buff => buff.remaining > 0);
  calc.concScoreBoost = calc.concScoreBuffs.reduce((sum, buff) => sum + buff.value, 0);
}
function concScoreBuffText(buffs = []) {
  return buffs.length ? buffs.map(buff => fmt(buff.value * 100, 2) + '%・残り' + buff.remaining + 'ターン').join(' / ') : 'なし';
}

function renderKyakkouSettings(list) {
  const setting = state.scenario.kyakkou;
  const section = document.createElement('section');
  section.id = 'kyakkou-settings'; section.className = 'stack';

  const controls = document.createElement('div'); controls.className = 'fields';
  for (const [key, text] of [['enabled', '脚光を有効'], ['national', '脚光に国民を適用']]) {
    const label = document.createElement('label'); label.className = 'check';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = setting[key];
    input.addEventListener('change', () => { state.scenario.kyakkou[key] = input.checked; recalculateAndSave(); });
    label.append(input, text); controls.append(label);
  }
  const upgradeLabel = document.createElement('label'); upgradeLabel.textContent = '脚光の強化';
  const upgrade = document.createElement('select'); upgrade.setAttribute('aria-label', '脚光の強化');
  const level = setting.upgradeLevel ?? (setting.enhanced ? 1 : 0);
  ['無印', '+', '++'].forEach((name, index) => upgrade.append(option(String(index), name, level === index)));
  upgrade.addEventListener('change', () => { state.scenario.kyakkou.upgradeLevel = Number(upgrade.value); state.scenario.kyakkou.enhanced = state.scenario.kyakkou.upgradeLevel > 0; recalculateAndSave(); });
  upgradeLabel.append(upgrade); controls.append(upgradeLabel);
  const label = document.createElement('label'); label.textContent = '局面開始時の脚光カウント';
  const count = document.createElement('select'); count.setAttribute('aria-label', label.textContent);
  count.append(option('0', '0：あと2回', setting.count === 0), option('1', '1：あと1回', setting.count === 1));
  count.addEventListener('change', () => { state.scenario.kyakkou.count = Number(count.value); recalculateAndSave(); });
  label.append(count); controls.append(label);
  section.append(controls); list.append(section);
}

function applyKyakkou(calc, card, events) {
  const setting = state.scenario.kyakkou;
  if (!setting.enabled || !['active', 'mental'].includes(card.kind)) return;
  if (calc.good > 20) {
    events.push('脚光: 好調21以上のためカウント維持 ' + calc.kyakkouCount + '/2');
    return;
  }
  calc.kyakkouCount += 1;
  events.push('脚光カウント: ' + calc.kyakkouCount + '/2');
  if (calc.kyakkouCount < 2) return;
  calc.kyakkouCount = 0;
  const level = setting.upgradeLevel ?? (setting.enhanced ? 1 : 0);
  const hits = setting.national ? 2 : 1;
  for (let i = 0; i < hits; i++) {
    addScore(calc, events, [5, 6, 7][level], {
      source: '脚光' + (hits === 2 ? '（国民 ' + (i + 1) + '/2）' : ''),
      concRate: level > 0 ? 4 : 3,
    });
    const before = calc.good;
    calc.good = Math.max(0, calc.good - 3);
    events.push('脚光: 好調減少3 ' + fmt(before) + ' → ' + fmt(calc.good));
  }
}

function normalizeConcScoreRows(raw = {}) {
  const rows = Array.isArray(raw.concScoreBoostRows) ? raw.concScoreBoostRows : [
    { percent: raw.concScoreBoost ?? 0, turns: raw.concScoreBoostTurns ?? raw.remainingTurns ?? 1 },
  ];
  return Array.from({ length: 3 }, (_, index) => ({
    percent: Math.max(0, number(rows[index]?.percent)),
    turns: clampInt(rows[index]?.turns, 0, 99, 1),
    fresh: Boolean(rows[index]?.fresh),
  }));
}

function migrateSavedData(data) {
  const loaded = migrateSavedDataWithLegacy(data);
  const convert = (cardId, config) => {
    if (!config) return;
    const card = loaded.cards.find(card => card.id === cardId);
    if (!card?.variants?.customs.some(custom => custom.id === config.custom && custom.snapshot)) return;
    const resolved = resolveCard(card, config);
    config.override = {
      preEffects: resolved.preEffects, effects: resolved.effects, reservedEffects: resolved.reservedEffects,
      kind: resolved.kind, ljReaction: resolved.ljReaction,
    };
    config.custom = ''; config.enhancement = '';
  };
  loaded.routes.forEach(route => route.turns.forEach(turn => turn.cardIds.forEach((id, index) => convert(id, turn.configs?.[index]))));
  [loaded.scenario, ...loaded.scenePresets.map(preset => preset.scenario)].forEach(scenario => {
    scenario.carryInCards.forEach(entry => convert(entry.cardId, entry.config));
  });
  loaded.cards.forEach(card => {
    if (card.variants) card.variants.customs = card.variants.customs.filter(custom => !custom.snapshot);
  });
  if (Number(data.version ?? 1) < 8) {
    const additions = RouteCardModel.makeCatalog().filter(card => ['始まりの合図', 'スリリング', 'アドリブ'].includes(card.name));
    for (const card of additions) {
      if (!loaded.cards.some(existing => existing.id === card.id || existing.name === card.name || (card.name === '始まりの合図' && existing.name === 'はじまりの合図'))) loaded.cards.push(card);
    }
  }
  if (!loaded.cards.some(card => card.id === 'route-drink:macchiato' || card.name === '厳選初星マキアート')) {
    loaded.cards.push(RouteCardModel.makeCatalog().find(card => card.id === 'route-drink:macchiato'));
  }
  return loaded;
}

function ceilScore(value) {
  const nearest = Math.round(value);
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(value)) * 8;
  return Math.abs(value - nearest) <= tolerance ? nearest : Math.ceil(value);
}



function endInitialGainBoostTurn(calc) {
  if (!calc.goodGainBoostFresh && calc.goodGainBoostRemaining > 0 && --calc.goodGainBoostRemaining === 0) calc.goodGainBoost = 0;
  if (!calc.concGainBoostFresh && calc.concGainBoostRemaining > 0) {
    calc.concGainBoostRemaining -= 1;
    if (calc.concGainBoostRemaining === 0) {
      calc.concGainBoost -= calc.timedConcGainBoost;
      calc.timedConcGainBoost = 0;
    }
  }
  calc.goodGainBoostFresh = false;
  calc.concGainBoostFresh = false;
}
