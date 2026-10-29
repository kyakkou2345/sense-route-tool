const Anomaly = (() => {
// Independent two-turn approximation. No Sense buffs or resource legality checks.
const STANCES = { none: '指針なし', reserve1: '温存1', reserve2: '温存2', strong1: '強気1', strong2: '強気2' };
const CATALOG = [
  { type: 'overdrive', name: 'オーバードライブ＋', kind: 'active', stance: 'strong', base: 4, hits: 2, nextReserve: true },
  { type: 'entertainer', name: 'エンターテイナー＋（成長済み）', kind: 'active', stance: 'strong', base: 12, hits: 4 },
  { type: 'comeback', name: '巻き返し＋', kind: 'mental', stance: 'reserve', add: 6 },
  { type: 'reversal', name: '形勢逆転＋', kind: 'active', stance: 'strong', base: 13, hits: 1 },
  { type: 'throttle', name: 'フルスロットル＋', kind: 'mental', stance: 'reserve', increase: 150 },
  { type: 'idol', name: 'アイドルになります', kind: 'mental', stance: 'reserve', grow: true },
];
const DEFAULT_INPUTS = { turn: 11, multiplier1: 43, multiplier2: 43, paramBoost: 0, stance: 'strong1', enthusiasm: 0, add: 0, increase: 0 };
function makeInstance(type, id) {
  const card = CATALOG.find(c => c.type === type);
  if (!card) throw new Error('未対応のカードです。');
  return { ...card, id };
}
function simulateAnomaly(inputs, cards, routes) {
  const s = { stance: inputs.stance, enthusiasm: inputs.enthusiasm, add: inputs.add, increase: inputs.increase, score: 0 };
  const hits = Object.fromEntries(cards.map(c => [c.id, c.hits || 0]));
  const rows = [], totals = [0, 0];
  let nextReserve = false;
  const changeStance = (target) => {
    const before = s.stance;
    if (target === 'reserve') s.stance = before.startsWith('reserve') ? 'reserve2' : 'reserve1';
    if (target === 'strong') s.stance = before.startsWith('strong') ? 'strong2' : 'strong1';
    let gain = 0;
    if (before.startsWith('reserve') && !s.stance.startsWith('reserve')) {
      gain = ((before === 'reserve2' ? 8 : 5) + s.add) * (1 + s.increase / 100);
      s.enthusiasm += gain;
    }
    return gain;
  };
  for (let t = 0; t < 2; t++) {
    if (t === 1) {
      const before = s.stance;
      s.enthusiasm = 0;
      if (nextReserve) changeStance('reserve');
      rows.push({ boundary: true, turn: inputs.turn + t, before, ...s, nextReserve });
    }
    for (const entry of routes[t]) {
      const c = cards.find(c => c.id === entry.cardId);
      if (!c) throw new Error('手順に存在しないカードが含まれています。');
      const before = s.stance, usedAdd = s.add, usedIncrease = s.increase;
      const gain = changeStance(c.stance);
      s.add += c.add || 0;
      s.increase += c.increase || 0;
      const targets = c.grow ? [...new Set(entry.targets || [])] : [];
      for (const id of targets) {
        if (!cards.some(card => card.id === id && card.kind === 'active')) throw new Error('成長対象は登録済みのアクティブカードを選んでください。');
        hits[id]++;
      }
      const count = hits[c.id];
      const stanceMultiplier = { none: 1, reserve1: 0.5, reserve2: 0.25, strong1: 2, strong2: 2.5 }[s.stance];
      const perHit = c.kind === 'active' ? (c.base + s.enthusiasm) * stanceMultiplier * (1 + inputs.paramBoost / 100) * (t ? inputs.multiplier2 : inputs.multiplier1) : 0;
      const score = perHit * count;
      totals[t] += score;
      s.score += score;
      if (c.nextReserve) nextReserve = true;
      // Top Quality is already active: one trigger per card, never per hit.
      const topAdd = inputs.topQualityActive !== false && c.kind === 'active' && s.stance.startsWith('strong') ? 3 : 0;
      const topIncrease = inputs.topQualityActive !== false && c.kind === 'mental' && s.stance.startsWith('reserve') ? 50 : 0;
      s.add += topAdd;
      s.increase += topIncrease;
      rows.push({ turn: inputs.turn + t, name: c.name, before, gain, usedAdd, usedIncrease, count, perHit, delta: score, targets, topAdd, topIncrease, ...s });
    }
  }
  return { rows, totals, final: s, hits };
}

return { CATALOG, STANCES, DEFAULT_INPUTS, makeInstance, simulateAnomaly };
})();