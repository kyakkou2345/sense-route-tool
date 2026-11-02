const RouteDrag = (() => {
  const narrow = window.matchMedia('(max-width: 600px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  let dragging = null, frame = 0, suppressClick = false;
  function move(route, fromTurn, fromIndex, toTurn, boundary) {
    const source = route?.turns[fromTurn], target = route?.turns[toTurn];
    if (!source || !target || !Number.isInteger(fromIndex) || fromIndex < 0 || fromIndex >= source.cardIds.length || !Number.isInteger(boundary) || boundary < 0 || boundary > target.cardIds.length) return false;
    const destination = boundary - (source === target && fromIndex < boundary ? 1 : 0);
    if (source === target && destination === fromIndex) return false;
    for (const turn of new Set([source, target])) {
      turn.upgraded = turn.cardIds.map((_, i) => Boolean(turn.upgraded?.[i]));
      turn.configs = turn.cardIds.map((_, i) => turn.configs?.[i] ?? blankConfig());
    }
    for (const key of ['cardIds', 'upgraded', 'configs']) {
      const [value] = source[key].splice(fromIndex, 1);
      target[key].splice(destination, 0, value);
    }
    return true;
  }

  function animate(row, from) {
    if (!from || reducedMotion.matches || !row.animate) return;
    const to = row.getBoundingClientRect();
    const x = from.left - to.left, y = from.top - to.top;
    if (Math.abs(x) < 1 && Math.abs(y) < 1) return;
    const animation = row.animate([
      { transform: `translate(${x}px,${y}px)` }, { transform: 'translate(0,0)' },
    ], { duration: 170, easing: 'cubic-bezier(.2,.8,.2,1)' });
    animations.set(row, animation);
    animation.onfinish = () => { if (animations.get(row) === animation) animations.delete(row); };
  }
  function clearAnimations() {
    for (const animation of animations.values()) animation.cancel();
    animations.clear();
  }
  function finish(commit = false) {
    const d = dragging;
    if (!d) return;
    dragging = null;
    cancelAnimationFrame(frame); frame = 0;
    const from = d.ghost?.getBoundingClientRect();
    d.ghost?.remove(); d.placeholder?.remove();
    d.row.classList.remove('route-drag-source');
    for (const container of d.containers) container.classList.remove('route-drop-active');
    document.body.classList.remove('route-pointer-dragging');
    clearAnimations();
    if (d.grid.hasPointerCapture?.(d.pointerId)) d.grid.releasePointerCapture(d.pointerId);
    let settled = d.row;
    if (commit && d.active && d.target && d.route === getSelectedRoute()) {
      const { turnIndex, boundary } = d.target;
      const destination = boundary - (d.turnIndex === turnIndex && d.index < boundary ? 1 : 0);
      RouteTools.sync();
      if (move(d.route, d.turnIndex, d.index, turnIndex, boundary)) {
        recalculateAndSave(true);
        settled = $('turn-grid').querySelectorAll('.turn-cards')[turnIndex]?.querySelectorAll('.card-step')[destination];
      }
    }
    if (settled?.isConnected) animate(settled, from);
  }
  function start(d) {
    d.active = true;
    const rect = d.row.getBoundingClientRect();
    d.offsetX = d.startX - rect.left; d.offsetY = d.startY - rect.top;
    d.ghost = d.row.cloneNode(true);
    d.ghost.classList.add('route-drag-ghost');
    d.ghost.setAttribute('aria-hidden', 'true');
    d.ghost.style.width = `${rect.width}px`;
    d.ghost.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    d.ghost.querySelectorAll('button,input,select,textarea').forEach(node => { node.tabIndex = -1; });
    d.placeholder = document.createElement('div');
    d.placeholder.className = 'route-drag-placeholder';
    d.placeholder.style.height = `${rect.height}px`;
    d.row.before(d.placeholder);
    d.row.classList.add('route-drag-source');
    document.body.append(d.ghost);
    document.body.classList.add('route-pointer-dragging');
  }
  function preview(d) {
    const hit = document.elementFromPoint(d.x, d.y);
    const container = hit?.closest('.turn-column')?.querySelector('.turn-cards');
    if (!container || !d.grid.contains(container)) {
      d.target = null; d.placeholder.classList.add('route-drop-invalid'); return;
    }
    d.placeholder.classList.remove('route-drop-invalid');
    const rows = [...container.querySelectorAll('.card-step')].filter(row => row !== d.row);
    const top = container.getBoundingClientRect().top + container.clientTop - container.scrollTop;
    const next = rows.find(row => d.y < top + row.offsetTop + row.offsetHeight / 2) ?? null;
    d.target = { turnIndex: Number(container.dataset.dragTurn), boundary: next ? Number(next.dataset.dragIndex) : d.route.turns[Number(container.dataset.dragTurn)].cardIds.length };
    for (const item of d.containers) item.classList.toggle('route-drop-active', item === container);
    let currentNext = d.placeholder.nextElementSibling;
    if (currentNext === d.row) currentNext = currentNext.nextElementSibling;
    if (d.placeholder.parentElement === container && currentNext === next) return;
    const previous = new Map([...d.grid.querySelectorAll('.card-step')]
      .filter(row => row !== d.row).map(row => [row, row.getBoundingClientRect()]));
    clearAnimations();
    container.insertBefore(d.placeholder, next);
    for (const [row, rect] of previous) animate(row, rect);
  }
  function scrollAtEdge(element, coordinate, horizontal = false) {
    const rect = element.getBoundingClientRect();
    const start = Math.max(0, horizontal ? rect.left : rect.top);
    const end = Math.min(horizontal ? innerWidth : innerHeight, horizontal ? rect.right : rect.bottom);
    const edge = Math.min(36, (end - start) / 3);
    if (edge <= 0 || coordinate < start || coordinate > end) return;
    const delta = coordinate < start + edge ? -12 * (1 - (coordinate - start) / edge)
      : coordinate > end - edge ? 12 * (1 - (end - coordinate) / edge) : 0;
    if (horizontal) element.scrollLeft += delta;
    else element.scrollTop += delta;
  }
  function tick() {
    const d = dragging;
    if (!d?.active) return;
    if (narrow.matches || !d.row.isConnected || d.route !== getSelectedRoute()) { finish(); return; }
    d.ghost.style.transform = `translate3d(${d.x - d.offsetX}px,${d.y - d.offsetY}px,0)`;
    const rect = d.grid.getBoundingClientRect();
    if (d.y >= rect.top && d.y <= rect.bottom) scrollAtEdge(d.grid, d.x, true);
    const hit = document.elementFromPoint(d.x, d.y)?.closest('.turn-column')?.querySelector('.turn-cards');
    if (hit && d.grid.contains(hit)) scrollAtEdge(hit, d.y);
    preview(d);
    frame = requestAnimationFrame(tick);
  }
  function install(route) {
    const grid = $('turn-grid');
    const containers = [...grid.querySelectorAll('.turn-cards')];
    containers.forEach((container, turnIndex) => {
      container.style.minHeight = '64px'; container.dataset.dragTurn = turnIndex;
      [...container.querySelectorAll('.card-step')].forEach((row, index) => {
        row.draggable = false; row.dataset.dragIndex = index;
        row.classList.add('route-drag-ready');
        row.title = 'ドラッグで並べ替え・別ターンへ移動';
        row.addEventListener('pointerdown', event => {
          if (narrow.matches || event.pointerType !== 'mouse' || event.button !== 0
            || event.target.closest('button,input,select,textarea,a') || route !== getSelectedRoute()) return;
          finish(); event.preventDefault();
          dragging = { route, row, grid, containers, turnIndex, index, pointerId: event.pointerId,
            startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, active: false, target: null };
          grid.setPointerCapture(event.pointerId);
        });
      });
    });
  }
  document.addEventListener('pointermove', event => {
    const d = dragging;
    if (!d || event.pointerId !== d.pointerId) return;
    d.x = event.clientX; d.y = event.clientY;
    if (!d.active) {
      if (Math.hypot(d.x - d.startX, d.y - d.startY) < 4) return;
      start(d); tick();
    }
    event.preventDefault();
  }, { passive: false });
  document.addEventListener('pointerup', event => {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    if (dragging.active) {
      dragging.x = event.clientX; dragging.y = event.clientY; preview(dragging);
      suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    }
    finish(true);
  });
  document.addEventListener('pointercancel', event => { if (event.pointerId === dragging?.pointerId) finish(); });
  document.addEventListener('lostpointercapture', event => { if (event.pointerId === dragging?.pointerId) finish(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && dragging) { event.preventDefault(); finish(); } });
  document.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); } }, true);
  window.addEventListener('blur', () => finish());
  const style = document.createElement('style');
  style.textContent = `
.turn-cards{position:relative}
@media(min-width:601px){.card-step.route-drag-ready{cursor:grab}}
.route-pointer-dragging,.route-pointer-dragging *{cursor:grabbing!important;user-select:none!important}
.card-step.route-drag-source{display:none!important}
.card-step.route-drag-ghost{position:fixed;left:0;top:0;margin:0;z-index:1000;pointer-events:none;box-shadow:0 8px 24px #0007;opacity:.95;will-change:transform}
.route-drag-placeholder{box-sizing:border-box;min-height:36px;border:2px dashed var(--accent,#82afd0);border-radius:5px;background:var(--accent-soft,#283d4a)}
.route-drag-placeholder.route-drop-invalid{opacity:.3}
.turn-cards.route-drop-active>.empty{display:none}
`;
  document.head.append(style);
  const render = renderTurnGrid;
  renderTurnGrid = function(route) { finish(); render(route); install(route); };
  renderRoutes();
  return { move };
})();
