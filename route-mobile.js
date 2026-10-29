(() => {
  const narrow = window.matchMedia('(max-width: 600px)');
  const activeTurns = new Map();
  const originalRender = renderTurnGrid;

  function moveCard(route, fromTurn, fromIndex, toTurn, boundary) {
    RouteTools.sync();
    if (!RouteDrag.move(route, fromTurn, fromIndex, toTurn, boundary)) return;
    activeTurns.set(route.id, toTurn);
    recalculateAndSave(true);
  }
  renderTurnGrid = function(route) {
    originalRender(route);
    const grid = document.getElementById('turn-grid');
    grid.classList.remove('mobile-turns-ready');
    grid.parentElement.querySelector('.mobile-turn-nav')?.remove();
    if (!route) return;
    const columns = [...grid.querySelectorAll('.turn-column')];
    if (!columns.length) return;
    let active = Math.min(activeTurns.get(route.id) ?? 0, columns.length - 1);
    const nav = document.createElement('nav');
    nav.className = 'mobile-turn-nav'; nav.setAttribute('aria-label', '編集するターン');
    const buttons = [];
    function selectTurn(index) {
      active = index; activeTurns.set(route.id, index);
      columns.forEach((column, i) => column.classList.toggle('mobile-active-turn', i === active));
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    }
    route.turns.forEach((turn, turnIndex) => {
      const remaining = route.turns.length - turnIndex;
      const tab = document.createElement('button'); tab.type = 'button';
      tab.textContent = `残り${remaining}T・${ATTRIBUTE_LABELS[turn.attribute]}`;
      tab.addEventListener('click', () => selectTurn(turnIndex)); buttons.push(tab); nav.append(tab);
      const rows = [...columns[turnIndex].querySelectorAll('.card-step')];
      rows.forEach((row, cardIndex) => {
        row.draggable = !narrow.matches;
        const actions = document.createElement('div'); actions.className = 'mobile-card-actions';
        const up = document.createElement('button'); up.type = 'button'; up.textContent = '↑';
        up.setAttribute('aria-label', 'カードを1つ上へ'); up.disabled = cardIndex === 0;
        up.addEventListener('click', () => moveCard(route, turnIndex, cardIndex, turnIndex, cardIndex - 1));
        const down = document.createElement('button'); down.type = 'button'; down.textContent = '↓';
        down.setAttribute('aria-label', 'カードを1つ下へ'); down.disabled = cardIndex === turn.cardIds.length - 1;
        down.addEventListener('click', () => moveCard(route, turnIndex, cardIndex, turnIndex, cardIndex + 2));
        const destination = document.createElement('select'); destination.setAttribute('aria-label', 'カードの移動先ターン');
        destination.append(option('', '別ターンへ', true));
        route.turns.forEach((target, index) => {
          if (index !== turnIndex) destination.append(option(String(index), `残り${route.turns.length - index}T・${ATTRIBUTE_LABELS[target.attribute]}`));
        });
        destination.hidden = route.turns.length < 2;
        destination.addEventListener('change', () => {
          if (destination.value === '') return;
          const index = Number(destination.value);
          if (!Number.isInteger(index) || !route.turns[index] || index === turnIndex) return;
          moveCard(route, turnIndex, cardIndex, index, route.turns[index].cardIds.length);
        });
        actions.append(up, down, destination); row.append(actions);
      });
    });
    grid.before(nav); selectTurn(active); grid.classList.add('mobile-turns-ready');
  };
  const originalRenderRoutes = renderRoutes;
  renderRoutes = function() {
    const result = originalRenderRoutes();
    const grid = document.getElementById('turn-grid');
    if (!grid.querySelector('.turn-column')) {
      grid.parentElement.querySelector('.mobile-turn-nav')?.remove();
      grid.classList.remove('mobile-turns-ready');
    }
    return result;
  };
  narrow.addEventListener('change', () => {
    document.querySelectorAll('#turn-grid .card-step').forEach(row => { row.draggable = !narrow.matches; });
  });
  renderRoutes();
})();
