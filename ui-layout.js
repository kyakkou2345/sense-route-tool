(() => {
  const $ = id => document.getElementById(id);
  const node = (tag, className, text) => { const el = document.createElement(tag); if(className) el.className = className; if(text) el.textContent = text; return el; };
  const shell = document.querySelector('.app-shell');
  const top = document.querySelector('.app-header');
  const nav = document.querySelector('.stepper');
  const main = document.querySelector('.screen-area');
  const setBar = document.querySelector('.set-bar');
  document.body.classList.add('review-layout');
  const workspace = node('div','review-workspace');
  const side = node('aside','review-side'); side.setAttribute('aria-label','メインメニュー');
  const sideTitle = node('div','review-brand','センス'); sideTitle.append(node('small','','ルート計算機')); side.append(sideTitle,nav);
  nav.querySelectorAll('.step-arrow').forEach(el=>el.remove());
  nav.querySelector('[data-step="2"]').textContent='ルート編集';
  const tools = node('div','review-side-tools');
  $('open-help').textContent='使い方';
  tools.append($('open-card-manager'),$('open-data'),$('open-help')); side.append(tools);
  top.hidden=true; document.body.append(top);
  workspace.append(setBar,main); shell.replaceChildren(side,workspace);

  // Keep original set operations and dialogs. Promote only existing new-save.
  const setSelect=setBar.querySelector('select');
  const originalSave=setBar.querySelector('button.primary');
  const newSave=node('button','','新規保存'); newSave.type='button'; newSave.id='review-new-save';
  newSave.onclick=()=>setBar.querySelector('.set-menu button').click();
  originalSave.after(newSave);
  const status=node('span','review-set-status'); status.setAttribute('role','status');
  setSelect.after(status);
  function syncSave() {
    const saved=Boolean(setSelect.value), changed=!setBar.querySelector('.set-dirty').hidden;
    const text=saved?(changed?'変更あり':'保存済み'):'セット未保存';
    if(status.textContent!==text)status.textContent=text;
    status.dataset.dirty=String(!saved||changed);
    const label=saved?'上書き保存':'新規保存';
    if(originalSave.textContent!==label)originalSave.textContent=label;
    if(newSave.hidden===saved)newSave.hidden=!saved;
  }
  new MutationObserver(syncSave).observe(setBar,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']}); syncSave();

  // Move the existing input nodes: no replacement controls or simplified forms.
  const scene=document.querySelector('.screen-grid.scene');
  const basic=$('remaining-turns').closest('.fields');
  const buffs=basic.querySelector('.buff-inputs');
  const concentration=buffs.querySelector('.conc-score-inputs');
  const multipliers=$('vo-multiplier').closest('.fields');
  const external=$('external-order');
  const carry=$('carry-in-list');
  const sceneLayout=node('div','review-scene-layout');
  function section(title,cls,...children){const box=node('section','review-section '+cls);const h=node('h2','',title);box.append(h,...children);return box;}
  const initial=section('初期値','review-initial',basic);
  const boost=section('増加量増加','review-increases',buffs);
  const conc=section('集中強化','review-concentration',concentration);
  const multi=section('ターン倍率','review-multipliers',multipliers);
  const ext=section('外部効果・脚光','review-external',external);
  const reservation=section('予約効果','review-reservation',carry);
  const reservationHead=node('div','panel-header'); reservationHead.append(reservation.querySelector('h2'),$('add-carry-in'));reservation.prepend(reservationHead);
  // Hidden legacy elements remain connected for old event bindings/migrations.
  const legacy=node('div');legacy.hidden=true; [...scene.children].forEach(el=>legacy.append(el));
  const leftColumn=node('div','review-scene-column');
  const rightColumn=node('div','review-scene-column');
  leftColumn.append(initial,conc,reservation);rightColumn.append(multi,ext,boost);
  sceneLayout.append(leftColumn,rightColumn);scene.replaceChildren(legacy,sceneLayout);
  const mobileScene=window.matchMedia('(max-width:600px)');
  nav.addEventListener('click',event=>{if(mobileScene.matches&&event.target.closest('[data-step]'))window.scrollTo({top:0,behavior:'instant'});},true);
  function placeReservation(){(mobileScene.matches?rightColumn:leftColumn).append(reservation);}
  mobileScene.addEventListener('change',placeReservation);placeReservation();
  $('initial-conc-gain-boost').closest('.buff-input-row').querySelector(':scope > span').textContent='集中増加量増加';
  $('initial-good-gain-boost').closest('.buff-input-row').querySelector(':scope > span').textContent='好調増加量増加';
  buffs.querySelectorAll('.buff-duration').forEach(label=>label.append(label.querySelector('span')));
  ['remaining-turns','previous-score','initial-concentration','initial-good','initial-param-boost'].forEach(id=>$(id).parentElement.classList.add('review-field-'+id));
  const externalBase=renderExternalOrder;
  renderExternalOrder=function(){
    externalBase.apply(this,arguments);
    external.querySelectorAll('.effect-order-item').forEach(row=>{
      const name=row.querySelector('.check')?.textContent.trim()||'';
      row.querySelectorAll(':scope > button').forEach(button=>{
        button.hidden=button.disabled;
        button.setAttribute('aria-label',name+(button.textContent==='↑'?'を上へ':'を下へ'));
      });
    });
  };
  renderExternalOrder();

  const routeSection=document.querySelector('.screen-grid.routes');
  const routesAside=routeSection.querySelector('aside');
  const routeActions=node('div','review-route-actions');
  const history=document.querySelector('.route-history-toolbar');
  const menu=node('details','review-route-menu');const summary=node('summary','','ルート削除');menu.append(summary);
  $('delete-route').textContent='選択したルートを削除';
  $('routes-clear').textContent='全ルートを削除';
  const menuBody=node('div','review-route-menu-body');menuBody.append($('delete-route'),$('routes-clear'));menu.append(menuBody);
  routeActions.append($('add-route'),$('duplicate-route'),history,menu);
  $('route-library').before(routeActions);
  routesAside.querySelectorAll('.panel-header,.button-row').forEach(el=>el.remove());
  const sortLabel=node('label','review-sort','並び順');
  const sort=node('select');sort.id='review-route-sort';sort.setAttribute('aria-label','ルートの並び順');
  sort.append(option('fixed','登録順'),option('score','スコア順'));sortLabel.append(sort);routeActions.append(sortLabel);
  let displayOrder=[];
  function orderRoutes(refresh=false){
    if(sort.value==='score'&&(refresh||!displayOrder.length)) displayOrder=[...latestResults].sort((a,b)=>b.totalScore-a.totalScore).map(r=>r.routeId);
    else if(sort.value==='fixed')displayOrder=state.routes.map(r=>r.id);
    const library=$('route-library');
    const items=[...library.children];
    items.sort((a,b)=>{const x=displayOrder.indexOf(a.dataset.routeId),y=displayOrder.indexOf(b.dataset.routeId);return (x<0?1e9:x)-(y<0?1e9:y);});
    items.forEach(item=>{item.setAttribute('role','button');item.setAttribute('aria-pressed',String(item.classList.contains('active')));library.append(item);});
  }
  sort.onchange=()=>orderRoutes(true);
  const refresh=node('button','','並べ直す');refresh.type='button';refresh.onclick=()=>orderRoutes(true);refresh.hidden=true;sort.after(refresh);
  sort.addEventListener('change',()=>refresh.hidden=sort.value!=='score');
  const renderRoutesBase=renderRoutes;
  renderRoutes=function(){renderRoutesBase.apply(this,arguments);orderRoutes();};
  $('route-undo').title='ルート操作を戻す';$('route-undo').setAttribute('aria-label','ルート操作を戻す');
  $('route-redo').title='ルート操作をやり直す';$('route-redo').setAttribute('aria-label','ルート操作をやり直す');

  // Keep pointer drag. Add equivalent keyboard controls without changing moves.
  let restoreCardFocus=null;
  $('route-card-dialog').addEventListener('close',()=>{ if(restoreCardFocus){ const {routeId,t,i}=restoreCardFocus; if(state.selectedRouteId===routeId)$('turn-grid').querySelectorAll('.turn-column')[t]?.querySelectorAll('.card-step')[i]?.querySelector('button')?.focus();restoreCardFocus=null;} });
  const renderTurnBase=renderTurnGrid;
  renderTurnGrid=function(route){
    renderTurnBase(route);
    [...$('turn-grid').querySelectorAll('.turn-column')].forEach((column,t)=>{
      const attr=column.querySelector('.attribute-select');attr.setAttribute('aria-label',`残り${route.turns.length-t}ターンの属性（全ルート）`);
      column.querySelector('.turn-add select').setAttribute('aria-label',`残り${route.turns.length-t}ターンに追加するカード`);
      const list=column.querySelector('.turn-cards');
      // Keep add at the end of the sequence in all viewports.
      column.append(column.querySelector('.turn-add'));
      [...list.querySelectorAll('.card-step')].forEach((row,i)=>{
        const full=row.querySelector('.card-step-name').textContent;
        row.querySelector('button').setAttribute('aria-label',`残り${route.turns.length-t}ターン ${i+1}枚目 ${full}の設定`);
        row.querySelector('button').addEventListener('click',()=>{restoreCardFocus={routeId:route.id,t,i};});
        const remove=[...row.querySelectorAll('button')].find(b=>b.textContent==='×');remove?.setAttribute('aria-label',`${full}を削除`);
        row.tabIndex=0;row.setAttribute('aria-label',`${i+1}枚目 ${full}。Altと矢印キーで移動`);
        row.addEventListener('keydown',e=>{
          if(!e.altKey||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
          e.preventDefault();let dest=t,at=i;
          if(e.key==='ArrowUp')at=i-1;if(e.key==='ArrowDown')at=i+2;
          if(e.key==='ArrowLeft')dest=t-1;if(e.key==='ArrowRight')dest=t+1;
          if(dest<0||dest>=route.turns.length||at<0||at>route.turns[t].cardIds.length)return;
          if(dest!==t)at=route.turns[dest].cardIds.length;
          RouteTools.sync();if(RouteDrag.move(route,t,i,dest,at)){recalculateAndSave(true);const targetIndex=dest===t?(e.key==='ArrowUp'?i-1:i+1):at;$('turn-grid').querySelectorAll('.turn-column')[dest]?.querySelectorAll('.card-step')[targetIndex]?.focus();}
        });
      });
    });
  };

  // Results remain the existing ranking and detailed log.
  const rankingBase=renderRanking;renderRanking=function(){rankingBase.apply(this,arguments);$('ranking').querySelectorAll('tbody tr').forEach(row=>{row.tabIndex=0;row.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();row.click();$('ranking').querySelector('tr.selected')?.focus({preventScroll:true});}});});};
  const editResult=node('button','primary','このルートを編集');editResult.id='review-edit-result';editResult.type='button';
  editResult.onclick=()=>{if(!state.routes.some(r=>r.id===state.selectedResultRouteId))return;state.selectedRouteId=state.selectedResultRouteId;cardManagerOpen=false;showStep(2);$('route-name').focus();};
  $('result-title').parentElement.append(editResult);
  const resultBase=renderResults;renderResults=function(){resultBase.apply(this,arguments);editResult.disabled=!state.routes.length;};
  const showBase=showStep;showStep=function(index){showBase(index);$('open-card-manager').classList.toggle('active',cardManagerOpen);};

  renderRoutes();renderResults();showStep(state.activeStep);

  // Preserve each original input and its native min/max/step and keyboard behavior.
  function separateNumberControls(){
    sceneLayout.querySelectorAll('input[type="number"]').forEach(input=>{
      if(input.closest('.review-number'))return;
      const label=input.getAttribute('aria-label')||input.closest('label')?.textContent.trim()||'数値';
      if(!input.hasAttribute('aria-label'))input.setAttribute('aria-label',label);
      const wrap=node('span','review-number');
      if(input.id)wrap.dataset.input=input.id;
      input.before(wrap);wrap.append(input);
      if(input.id==='previous-score'){wrap.classList.add('review-number-score');return;}
      const controls=node('span','review-number-controls');
      [[1,'▴','増やす'],[-1,'▾','減らす']].forEach(([direction,symbol,action])=>{
        const button=node('button','',symbol);button.type='button';button.tabIndex=-1;
        button.setAttribute('aria-label',label+'を'+action);button.title=label+'を'+action;
        button.addEventListener('click',event=>{
          event.preventDefault();event.stopPropagation();
          if(input.disabled||input.readOnly)return;
          const before=input.value;
          if(direction>0)input.stepUp();else input.stepDown();
          if(input.value!==before){input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
        });
        controls.append(button);
      });
      wrap.append(controls);
    });
  }
  separateNumberControls();
  new MutationObserver(separateNumberControls).observe(sceneLayout,{childList:true,subtree:true});
})();
