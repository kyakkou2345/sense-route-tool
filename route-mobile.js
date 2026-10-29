(() => {
  const narrow = window.matchMedia('(max-width: 600px)');
  const activeTurns = new Map();
  const originalRender = renderTurnGrid;

  function capturePosition() {
    const x = window.scrollX, y = window.scrollY;
    const elements = [document.getElementById('route-library'), document.querySelector('.mobile-turn-nav')]
      .filter(Boolean).map(element => ({ element, left: element.scrollLeft, top: element.scrollTop }));
    return () => {
      elements.forEach(({element, left, top}) => {
        const target = element.classList.contains('mobile-turn-nav')
          ? document.querySelector('.mobile-turn-nav') : element;
        if (target) { target.scrollLeft = left; target.scrollTop = top; }
      });
      window.scrollTo({ left: x, top: y, behavior: 'instant' });
    };
  }
  function keepPosition(action) {
    if (!narrow.matches) return action();
    const restore = capturePosition();
    const result = action();
    restore(); window.requestAnimationFrame(restore);
    return result;
  }
  function moveCard(route, fromTurn, fromIndex, toTurn, boundary) {
    RouteTools.sync();
    if (!RouteDrag.move(route, fromTurn, fromIndex, toTurn, boundary)) return;
    activeTurns.set(route.id, toTurn);
    keepPosition(() => recalculateAndSave(true));
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
        actions.append(up, down); row.append(actions);
      });
    });
    grid.before(nav); selectTurn(active); grid.classList.add('mobile-turns-ready');
  };
  const originalRenderRoutes = renderRoutes;
  renderRoutes = function() {
    return keepPosition(() => {
      const result = originalRenderRoutes();
      const grid = document.getElementById('turn-grid');
      if (!grid.querySelector('.turn-column')) {
        grid.parentElement.querySelector('.mobile-turn-nav')?.remove();
        grid.classList.remove('mobile-turns-ready');
      }
      return result;
    });
  };
  narrow.addEventListener('change', () => {
    document.querySelectorAll('#turn-grid .card-step').forEach(row => { row.draggable = !narrow.matches; });
  });
  renderRoutes();
})();
