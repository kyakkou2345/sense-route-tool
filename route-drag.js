const RouteDrag = (() => {
  let dragging = null;
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
  function clearMarks() {
    document.querySelectorAll('.route-drop-before,.route-drop-after,.route-drop-empty').forEach(n => n.classList.remove('route-drop-before','route-drop-after','route-drop-empty'));
  }
  function finish() {
    dragging = null; clearMarks();
    document.querySelectorAll('.route-dragging').forEach(n => n.classList.remove('route-dragging'));
  }
  function insertion(container, y) {
    const rows = [...container.querySelectorAll('.card-step')];
    const index = rows.findIndex(row => { const r=row.getBoundingClientRect(); return y < r.top+r.height/2; });
    return { rows, index: index < 0 ? rows.length : index };
  }
  function install(route) {
    const grid = $('turn-grid');
    [...grid.querySelectorAll('.turn-cards')].forEach((container, turnIndex) => {
      container.style.minHeight = '64px';
      [...container.querySelectorAll('.card-step')].forEach((row, index) => {
        row.draggable = true;
        row.title = 'ドラッグで並べ替え・別ターンへ移動';
        row.addEventListener('dragstart', event => {
          if (event.target.closest('button,input,select')) { event.preventDefault(); return; }
          dragging = { route, turnIndex, index };
          event.dataTransfer.effectAllowed='move';
          event.dataTransfer.setData('text/plain', route.turns[turnIndex].cardIds[index]);
          row.classList.add('route-dragging');
        });
        row.addEventListener('dragend', finish);
      });
      container.addEventListener('dragover', event => {
        if (!dragging || dragging.route !== getSelectedRoute() || dragging.route !== route) return;
        event.preventDefault(); event.dataTransfer.dropEffect='move'; clearMarks();
        const {rows,index}=insertion(container,event.clientY);
        if (!rows.length) container.classList.add('route-drop-empty');
        else if(index===rows.length) rows.at(-1).classList.add('route-drop-after');
        else rows[index].classList.add('route-drop-before');
      });
      container.addEventListener('dragleave', event => { if (!container.contains(event.relatedTarget)) clearMarks(); });
      container.addEventListener('drop', event => {
        if (!dragging || dragging.route !== getSelectedRoute() || dragging.route !== route) return;
        event.preventDefault();
        const source=dragging, {index}=insertion(container,event.clientY); finish();
        RouteTools.sync();
        if (move(route,source.turnIndex,source.index,turnIndex,index)) recalculateAndSave(true);
      });
    });
  }
  const style=document.createElement('style');
  style.textContent='.card-step[draggable="true"]{cursor:grab}.card-step.route-dragging{opacity:.4}.card-step.route-drop-before{box-shadow:0 -3px 0 #65c7ff}.card-step.route-drop-after{box-shadow:0 3px 0 #65c7ff}.turn-cards.route-drop-empty{outline:2px dashed #65c7ff;outline-offset:-2px;background:#65c7ff18}';
  document.head.append(style);
  const render=renderTurnGrid;
  renderTurnGrid=function(route){render(route);install(route);};
  renderRoutes();
  return {move};
})();

