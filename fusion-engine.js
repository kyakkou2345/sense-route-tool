const FusionEngine = (() => {
  const TYPES = [
    { value: 'reserve', label: '温存に変更' }, { value: 'strong', label: '強気に変更' },
    { value: 'reserve2', label: '温存2に変更' },
    { value: 'sweetReturn1', label: '甘く溶ける心：温存へ（回数）' },
    { value: 'sweetReturn2', label: '甘く溶ける心：温存2へ（回数）' },
    { value: 'enthusiasm', label: '現在熱意+' }, { value: 'enthusiasmAdd', label: '熱意追加+' },
    { value: 'enthusiasmIncrease', label: '熱意増加%+' }, { value: 'growHits', label: '対象カードの上昇回数+' },
  ];
  function convert(card) {
    if (card.effectSchema === 1) return ensureVariants(card);
    const e = (type, value, more = {}) => makeEffect({ type, value, ...more });
    const result = structuredClone(card);
    result.preEffects ??= []; result.effects ??= []; result.reservedEffects ??= [];
    if (!result.effects.length && (card.type || card.stance || card.base != null)) {
      if (['reserve', 'strong'].includes(card.stance)) result.effects.push(e(card.stance, 1));
      if (card.add) result.effects.push(e('enthusiasmAdd', card.add));
      if (card.increase) result.effects.push(e('enthusiasmIncrease', card.increase));
      if (card.grow) result.effects.push(e('growHits', 1));
      if (card.kind === 'active') result.effects.push(e('score', card.base || 0, { count: card.hits ?? 1 }));
      if (card.nextReserve) result.reservedEffects.push(makeReservedEffect({ type: 'reserve', value: 1, delay: 1, repeat: 1, interval: 1 }));
    }
    result.effectSchema = 1;
    if (card.type) result.name = result.name.replace(/＋(?=（成長済み）$|$)/, '');
    return ensureVariants(result);
  }
  function calculate(scenario, cards, route, fusion) {
    const a = scenario.anomaly;
    const s = { stance: a.stance, enthusiasm: a.enthusiasm, add: a.add, increase: a.increase, score: 0,
      concentration: fusion ? scenario.concentration : 0, good: fusion ? scenario.good : 0, paramBoost: scenario.paramBoost,
      concGain: 0, concScore: 0, sweetRemaining: 0, sweetLevel: 2 };
    let temporaryItemAdd = 0;
    const growth = {}, queue = [], rows = [], totals = route.turns.map(() => 0), warnings = [];
    for (const id of new Set(a.initialIdolTargets || [])) {
      if (cards.some(card => card.id === id && card.kind === 'active')) growth[id] = 1;
    }
    const expiring = [];
    let currentTurnIndex = 0;
    function stance(target, level) {
      const before = s.stance;
      s.stance = level ? `${target}${level}` : s.stance.startsWith(target) ? `${target}2` : `${target}1`;
      if (before.startsWith('reserve') && !s.stance.startsWith('reserve')) {
        const gain = ceilScore(((before === 'reserve2' ? 8 : 5) + s.add) * (1 + s.increase / 100));
        s.enthusiasm += gain; return gain;
      }
      return 0;
    }
    function effects(list, card, targets, multiplier, record) {
      for (const e of list) {
        if (e.count === 0) continue;
        const v = number(e.value);
        switch (e.type) {
          case 'reserve': record.gain += stance('reserve'); break;
          case 'reserve2': record.gain += stance('reserve', 2); break;
          case 'strong': record.gain += stance('strong'); break;
          case 'sweetReturn1': case 'sweetReturn2':
            s.sweetRemaining = Math.max(0, Math.floor(v));
            s.sweetLevel = e.type === 'sweetReturn2' ? 2 : 1;
            break;
          case 'enthusiasm': s.enthusiasm = Math.max(0, s.enthusiasm + v); break;
          case 'enthusiasmAdd': s.add += v; break;
          case 'enthusiasmIncrease': {
            s.increase += v;
            const duration = e.duration ?? (card.type === 'throttle' ? 3 : 0);
            if (duration > 0) expiring.push({ at: currentTurnIndex + duration, value: v });
            break;
          }
          case 'growHits':
            for (const id of targets) growth[id] = (growth[id] || 0) + Math.max(0, Math.floor(v));
            record.targets.push(...targets); break;
          case 'concentration': if (fusion) s.concentration = Math.max(0, s.concentration + (v > 0 ? ceilScore(v * (1 + s.concGain / 100)) : v)); break;
          case 'good': if (fusion) s.good = Math.max(0, s.good + v); break;
          case 'paramBoost': s.paramBoost += v; break;
          case 'concGainBoost': if (fusion) s.concGain += v; break;
          case 'concScoreBoost': if (fusion) s.concScore += v; break;
          case 'score': case 'goodScore': {
            let growthBase = 0;
            if (fusion && card.kind === 'active' && e.type === 'score') {
              if (card.id === 'route-card:シュプ' || /^(シュプレヒコール|シュプ)/.test(card.name)) growthBase = number(a.chantGrowth);
              else if (['overdrive', 'entertainer', 'reversal'].includes(card.type)) growthBase = number(a.chantGrowth) + 38;
            }
            const base = e.type === 'goodScore' ? s.good * v / 100 : v + growthBase;
            const count = Math.max(0, Math.floor(e.count ?? 1)) + (growth[card.id] || 0);
            const mult = { none: 1, reserve1: .5, reserve2: .25, strong1: 2, strong2: 2.5 }[s.stance];
            const hit = fusion ? calculateScore({
              concentration: s.concentration, good: s.good, superGood: scenario.superGood,
              concScoreBoost: s.concScore / 100, paramBoost: s.paramBoost / 100, turnMultiplier: multiplier,
            }, base + s.enthusiasm, {
              concRate: number(e.concRate, 1), goodRate: number(e.goodRate, 1), stanceMultiplier: mult,
            }).result : (base + s.enthusiasm) * mult * (1 + s.paramBoost / 100) * multiplier;
            record.delta += hit * count; record.count += count; record.perHit = hit;
            record.attacks.push({ base, growthBase, count, hit, concentration: s.concentration, good: s.good, enthusiasm: s.enthusiasm });
            break;
          }
          default: warnings.push(`未対応の効果：${e.type}`);
        }
      }
    }
    function record(turn, name) { return { turn, name, before: s.stance, usedAdd: s.add, usedIncrease: s.increase, gain: 0, count: 0, perHit: 0, delta: 0, targets: [], attacks: [], topAdd: 0, topIncrease: 0 }; }
    route.turns.forEach((turn, t) => {
      currentTurnIndex = t;
      for (const buff of expiring.filter(buff => buff.at === t)) s.increase -= buff.value;
      const turnNo = a.turn + t, multiplier = scenario.multipliers[turn.attribute] / 100;
      if (t) {
        s.add -= temporaryItemAdd; temporaryItemAdd = 0;
        const before = s.stance; s.enthusiasm = 0; if (fusion) s.good = Math.max(0, s.good - 1);
        rows.push({ boundary: true, turn: turnNo, before, ...s, nextReserve: queue.some(q => q.at === t && ['reserve', 'reserve2'].includes(q.effect.type)) });
      }
      const due = queue.filter(q => q.at === t);
      // Repeated Overdrives reserve the same next-turn stance once.
      let reserved = false;
      for (const q of due) {
        if (q.effect.type === 'reserve' && reserved) continue;
        if (q.effect.type === 'reserve') reserved = true;
        const r = record(turnNo, `${q.card.name}（予約）`);
        effects([q.effect], q.card, [], multiplier, r);
        s.score += r.delta; totals[t] += r.delta; rows.push({ ...r, ...s });
      }
      turn.cardIds.forEach((id, i) => {
        const definition = cards.find(c => c.id === id); if (!definition) return;
        const config = turn.configs?.[i] || blankConfig();
        const card = resolveCard(definition, config);
        if (card.unconfigured) warnings.push(`${card.name}：追加強化が未設定です`);
        const targets = [...new Set(config.targets || [])].filter(id => cards.some(c => c.id === id && c.kind === 'active'));
        const r = record(turnNo, card.name);
        effects(card.preEffects, card, targets, multiplier, r);
        if (a.swayingThoughts && card.kind === 'active') {
          r.gain += stance('strong');
          s.add += 3; temporaryItemAdd += 3;
          r.itemTriggered = true;
        }
        effects(card.effects, card, targets, multiplier, r);
        for (const e of card.reservedEffects || []) {
          if (e.count === 0) continue;
          for (let n = 0; n < Math.max(0, Math.floor(e.repeat ?? 1)); n++) queue.push({ at: t + Math.max(1, Math.floor(e.delay ?? 1)) + n * Math.max(1, Math.floor(e.interval ?? 1)), effect: e, card });
        }
        if (a.topQualityActive !== false) {
          if (card.kind === 'active' && s.stance.startsWith('strong')) s.add += r.topAdd = 3;
          if (card.kind === 'mental' && s.stance.startsWith('reserve')) s.increase += r.topIncrease = 50;
        }
        if (card.kind === 'active' && s.stance === 'strong2' && s.sweetRemaining > 0) {
          stance('reserve', s.sweetLevel);
          s.sweetRemaining--;
          r.sweetTriggered = true;
        }
        s.score += r.delta; totals[t] += r.delta;
        rows.push({ ...r, ...s });
      });
    });
    return { rows, totals, final: s, warnings: [...new Set(warnings)] };
  }
  return { TYPES, convert, calculate };
})();
