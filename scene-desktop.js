// PC-only layout. Existing input nodes and their state are retained on mobile.
(() => {
  const desktop = window.matchMedia('(min-width: 601px)');
  const scene = document.querySelector('.screen-grid.scene');
  if (!scene) return;
  const basicFields = $('initial-concentration').closest('.fields');
  const multipliers = $('vo-multiplier').closest('.fields');
  const concentration = document.querySelector('.conc-score-inputs');
  const increases = document.querySelector('.buff-inputs');
  const external = $('external-order'), carryIn = $('carry-in-list'), addCarryIn = $('add-carry-in');
  const originals = [basicFields.closest('section'), external.closest('section')];
  let active = false, layout, boxes, dynamic, anchors = [], staticCleanup = [];

  function move(node, parent) {
    const anchor = document.createComment('PC layout return point');
    node.before(anchor); anchors.push({node, anchor}); parent.append(node);
  }
  function box(title, name) {
    const section = document.createElement('section');
    section.className = `panel pc-scene-box pc-scene-${name}`;
    section.setAttribute('aria-label', title);
    const header = document.createElement('div'); header.className = 'panel-header';
    const heading = document.createElement('h2'); heading.textContent = title;
    const body = document.createElement('div'); body.className = 'pc-scene-body';
    header.append(heading); section.append(header, body);
    return {section, header, body};
  }
  function labelText(label, text, cleanup) {
    const nodes = [...label.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
    const previous = nodes.map(node => node.textContent);
    if (!nodes.length) return;
    nodes.forEach((node, i) => { node.textContent = i ? '' : text; });
    cleanup.push(() => nodes.forEach((node, i) => { node.textContent = previous[i]; }));
  }
  function configureKyakkou(section, cleanup) {
    const controls = section.querySelector('.fields');
    const labels = [...controls.children];
    const enabledLabel = labels[0], nationalLabel = labels[1], upgradeLabel = labels[2], countLabel = labels[3];
    const enabled = enabledLabel.querySelector('input'), upgrade = upgradeLabel.querySelector('select');
    const choices = document.createElement('fieldset'); choices.className = 'pc-kyakkou-choices';
    const legend = document.createElement('legend'); legend.className = 'pc-scene-sr'; legend.textContent = '脚光の強化';
    choices.append(legend);
    const checks = [];
    ['未強化', '＋', '＋＋'].forEach((text, level) => {
      const label = document.createElement('label'); label.className = 'check';
      const input = document.createElement('input'); input.type = 'checkbox';
      input.checked = state.scenario.kyakkou.enabled && Number(upgrade.value) === level;
      input.addEventListener('change', () => {
        const setting = state.scenario.kyakkou;
        setting.enabled = input.checked;
        if (input.checked) {
          setting.upgradeLevel = level; setting.enhanced = level > 0;
          upgrade.value = String(level);
        }
        enabled.checked = setting.enabled;
        checks.forEach((check, i) => { check.checked = setting.enabled && i === setting.upgradeLevel; });
        recalculateAndSave();
      });
      checks.push(input); label.append(input, text); choices.append(label);
    });
    enabledLabel.classList.add('pc-scene-hide'); upgradeLabel.classList.add('pc-scene-hide');
    controls.classList.add('pc-kyakkou-controls'); controls.prepend(choices);
    labelText(nationalLabel, '国民脚光', cleanup);
    labelText(countLabel, '脚光発動まで', cleanup);
    cleanup.push(() => {
      choices.remove(); enabledLabel.classList.remove('pc-scene-hide');
      upgradeLabel.classList.remove('pc-scene-hide'); controls.classList.remove('pc-kyakkou-controls');
    });
  }
  function restoreDynamic() {
    if (!dynamic) return;
    dynamic.cleanup.reverse().forEach(undo => undo());
    dynamic.settings.prepend(dynamic.national);
    dynamic.row.append(dynamic.tenshin, dynamic.macchiato);
    external.append(dynamic.summer, dynamic.row, dynamic.kyakkou);
    dynamic = null;
  }
  function arrangeDynamic() {
    const rows = [...external.querySelectorAll('.effect-order-item')];
    const entertainment = rows.find(row => row.querySelector('.effect-settings')?.children.length === 2);
    const summer = rows.find(row => row.querySelector('.effect-settings input[type="number"]'));
    const row = [...external.children].find(node => node.classList.contains('row'));
    const kyakkou = $('kyakkou-settings');
    if (!entertainment || !summer || !row || !kyakkou) return;
    const settings = entertainment.querySelector('.effect-settings');
    const [national, enhanced] = [...settings.children];
    const [tenshin, macchiato] = [...row.querySelectorAll('label')];
    const cleanup = [];
    dynamic = {settings, national, summer, row, tenshin, macchiato, kyakkou, cleanup};
    labelText(national, '国民エンタメ', cleanup);
    labelText(enhanced, '強化済み', cleanup);
    boxes.externalExtras.append(national, summer, tenshin, macchiato);
    boxes.kyakkou.body.append(kyakkou); row.remove();
    configureKyakkou(kyakkou, cleanup);
  }
  function activate() {
    if (active) return;
    active = true;
    layout = document.createElement('div'); layout.className = 'pc-scene-layout';
    boxes = {
      basic: box('初期値の設定', 'basic'), increases: box('増加量増加系', 'increases'),
      multipliers: box('ターン倍率', 'multipliers'), kyakkou: box('脚光', 'kyakkou'),
      concentration: box('集中強化', 'concentration'), external: box('外部効果', 'external'),
      reservation: box('予約効果（破竹の勢い等）', 'reservation'), externalExtras: document.createElement('div'),
    };
    boxes.externalExtras.className = 'pc-external-extras';
    for (const [name, items] of [
      ['initial', ['basic', 'multipliers']],
      ['sense', ['kyakkou', 'concentration', 'increases']], ['effects', ['external', 'reservation']],
    ]) {
      const column = document.createElement('div'); column.className = `pc-scene-column pc-scene-column-${name}`;
      items.forEach(key => column.append(boxes[key].section)); layout.append(column);
    }
    move(basicFields, boxes.basic.body);
    move(concentration, boxes.concentration.body);
    move(increases, boxes.increases.body);
    for (const row of increases.querySelectorAll('.buff-input-row')) {
      labelText(row.querySelector('span'), row.querySelector('#initial-conc-gain-boost') ? '集中増加量' : '好調増加量', staticCleanup);
      labelText(row.querySelector('.buff-duration > span'), 'ターン', staticCleanup);
    }
    move(multipliers, boxes.multipliers.body);
    move(external, boxes.external.body); boxes.external.body.append(boxes.externalExtras);
    move(addCarryIn, boxes.reservation.header); move(carryIn, boxes.reservation.body);
    originals.forEach(node => node.classList.add('pc-scene-original'));
    scene.classList.add('pc-scene-enabled'); scene.append(layout);
    arrangeDynamic();
  }
  function deactivate() {
    if (!active) return;
    restoreDynamic();
    staticCleanup.reverse().forEach(undo => undo()); staticCleanup = [];
    anchors.reverse().forEach(({node, anchor}) => anchor.replaceWith(node)); anchors = [];
    originals.forEach(node => node.classList.remove('pc-scene-original'));
    scene.classList.remove('pc-scene-enabled'); layout.remove();
    layout = boxes = null; active = false;
  }
  const render = renderExternalOrder;
  renderExternalOrder = function() {
    if (active) restoreDynamic();
    const result = render.apply(this, arguments);
    if (active) arrangeDynamic();
    return result;
  };
  desktop.addEventListener('change', () => desktop.matches ? activate() : deactivate());
  if (desktop.matches) activate();
})();
