const RouteCardEditor = (() => {
const {blankConfig, ensureVariants, resolveCard} = RouteCardModel;

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function select(label, choices, value, change) {
  const wrapper = el('label', label);
  const input = el('select');
  input.setAttribute('aria-label', label);
  for (const [id, name] of choices) {
    const option = el('option', name);
    option.value = id;
    option.selected = id === value;
    input.append(option);
  }
  input.addEventListener('change', () => change(input.value));
  wrapper.append(input);
  return wrapper;
}
function button(label, action) {
  const node = el('button', label, 'small');
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

const definitionViews = new Map();
function definitionView(card) {
  if (!definitionViews.has(card.id)) definitionViews.set(card.id, {mode:'strength',strength:'base',custom:''});
  return definitionViews.get(card.id);
}
function definitionTarget(card, view) {
  if (view.mode === 'custom') return card.variants.customs.find(group => group.id === view.custom && !group.snapshot);
  if (view.strength === 'base') return null;
  if (view.strength === 'plus') return {name:'＋',patches:card.variants.plus};
  return card.variants.enhancements.find(group => group.id === view.strength);
}
function definitionConfig(view) {
  if(view.mode==='custom') return {base:'plus',custom:view.custom,enhancement:''};
  return {base:view.strength==='base'?'base':'plus',custom:'',enhancement:['base','plus'].includes(view.strength)?'':view.strength};
}
function writeDefinitionValue(card,group,config,effectId,field,value) {
  const resolved=resolveCard(card,config);
  const effect=[...resolved.preEffects,...resolved.effects,...resolved.reservedEffects].find(e=>e.id===effectId);
  if(!effect)return;
  const matches=group.patches.filter(p=>p.effectId===effectId&&p.field===field);
  const last=matches.at(-1);
  if(last)last.value=last.mode==='add'?Number(last.value)+value-Number(effect[field]??0):value;
  else group.patches.push({effectId,field,mode:'set',value});
  if('configured' in group)group.configured=true;
}
function renderVariants(card, types, changed) {
  ensureVariants(card);
  const view=definitionView(card),group=definitionTarget(card,view);
  const box=el('section','','definition-variant');
  if(!group)return box;
  const config=definitionConfig(view),resolved=resolveCard(card,config);
  const header=el('div','','definition-group-header');
  if(view.mode==='strength') header.append(el('h3',group.name));
  else {
    const name=el('input');name.value=group.name;name.setAttribute('aria-label','設定名');
    name.addEventListener('change',()=>{group.name=name.value;changed();});header.append(name);
  }
  if('configured' in group){
    const label=el('label','','check'),input=el('input');input.type='checkbox';input.checked=group.configured;
    input.addEventListener('change',()=>{group.configured=input.checked;changed();});label.append(input,'設定済み');header.append(label);
  }
  box.append(header);
  for(const [key,title]of [['preEffects','使用前'],['effects','使用時'],['reservedEffects','予約']]){
    const effects=resolved[key];if(!effects.length)continue;
    const section=el('section','','definition-effect-section');section.append(el('h3',title));
    for(const effect of effects){
      const row=el('div','','definition-value-row');
      row.append(el('strong',types.find(t=>t.value===effect.type)?.label??effect.type));
      const fields=[['value','効果量']];
      if(['score','goodScore'].includes(effect.type))fields.push(['count','回数'],['concRate','集中倍率'],['goodRate','好調倍率']);
      if(effect.type==='concScoreBoost')fields.push(['duration','持続ターン']);
      if(key==='reservedEffects')fields.push(['delay','何ターン後'],['repeat','発動回数'],['interval','間隔']);
      for(const [field,labelText]of fields){
        const label=el('label',labelText),input=el('input');input.type='number';input.step='1';input.value=effect[field]??(field==='duration'?3:0);
        input.setAttribute('aria-label',title+' '+(types.find(t=>t.value===effect.type)?.label??effect.type)+' '+labelText);
        input.addEventListener('change',()=>{writeDefinitionValue(card,group,config,effect.id,field,Number(input.value)||0);changed();});
        label.append(input);row.append(label);
      }
      section.append(row);
    }
    box.append(section);
  }
  const detail=el('details','','definition-advanced');detail.open=Boolean(view.rulesOpen);detail.addEventListener('toggle',()=>{view.rulesOpen=detail.open;});detail.append(el('summary','変更ルール'));
  if(view.mode==='strength'&&view.strength!=='plus') {
    const nameLabel=el('label','設定名'),name=el('input');name.value=group.name;name.setAttribute('aria-label','設定名');
    name.addEventListener('change',()=>{group.name=name.value;changed();});nameLabel.append(name);detail.append(nameLabel);
  }
  const targets=[...card.preEffects.map(e=>[e,'使用前']),...card.effects.map(e=>[e,'使用時']),...card.reservedEffects.map(e=>[e,'予約'])];
  for(const [index,change]of group.patches.entries()){
    const row=el('div','','variant-row definition-patch-row');
    const choices=targets.map(([e,location],i)=>[e.id,`${location} ${i+1}：${types.find(t=>t.value===e.type)?.label??e.type}`]);
    if(!choices.some(([id])=>id===change.effectId))choices.unshift([change.effectId,'削除済みの効果']);
    row.append(select('対象',choices,change.effectId,v=>{change.effectId=v;changed();}));
    row.append(select('項目',[['value','値'],['count','回数（0で無効）'],['concRate','集中倍率'],['goodRate','好調倍率'],['delay','何ターン後'],['repeat','発動回数'],['interval','間隔'],['duration','持続ターン'],['goodThreshold','好調の上限条件']],change.field,v=>{change.field=v;changed();}));
    row.append(select('変更方法',[['set','置き換え'],['add','加算']],change.mode,v=>{change.mode=v;changed();}));
    const label=el('label','数値'),input=el('input');input.type='number';input.step='1';input.value=change.value;
    input.addEventListener('change',()=>{change.value=Number(input.value)||0;if('configured' in group)group.configured=true;changed();});label.append(input);row.append(label);
    row.append(button('×',()=>{group.patches.splice(index,1);changed();}));detail.append(row);
  }
  detail.append(button('＋効果の変更',()=>{if(!targets.length)return;group.patches.push({effectId:targets[0][0].id,field:'value',mode:'add',value:0});changed();}));
  box.append(detail);
  if(view.mode==='custom'){
    const footer=el('div','','definition-custom-actions');
    footer.append(button('カスタムを削除',()=>{card.variants.customs=card.variants.customs.filter(g=>g!==group);view.custom=card.variants.customs.find(g=>!g.snapshot)?.id??'';changed();}));box.append(footer);
  }
  return box;
}
function renderDefinition(card,types,changed,editEffects) {
  ensureVariants(card);
  const view=definitionView(card),box=el('section','','definition-workspace');
  const tabs=el('div','','definition-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','編集するカード状態');
  const choices=[['base','無印'],['plus','＋'],...card.variants.enhancements.map(g=>[g.id,g.name])];
  for(const [id,name]of choices){
    const tab=button(name,()=>{view.mode='strength';view.strength=id;changedView();});
    tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(view.mode==='strength'&&view.strength===id));tabs.append(tab);
  }
  const customTab=button('カスタム',()=>{view.mode='custom';if(!card.variants.customs.some(g=>g.id===view.custom&&!g.snapshot))view.custom=card.variants.customs.find(g=>!g.snapshot)?.id??'';changedView();});
  customTab.classList.add('definition-custom-tab');customTab.setAttribute('role','tab');customTab.setAttribute('aria-selected',String(view.mode==='custom'));tabs.append(customTab);box.append(tabs);
  const body=el('div','','definition-body');box.append(body);
  function changedView(){const next=renderDefinition(card,types,changed,editEffects);box.replaceWith(next);}
  if(view.mode==='custom'){
    const bar=el('div','','definition-custom-bar');
    bar.append(select('カスタム',card.variants.customs.filter(g=>!g.snapshot).map(g=>[g.id,g.name]),view.custom,v=>{view.custom=v;changedView();}));
    bar.append(button('＋新しいカスタムの追加',()=>{const group={id:crypto.randomUUID(),name:'新規カスタマイズ',patches:[]};card.variants.customs.push(group);view.custom=group.id;changed();}));body.append(bar);
  }
  if(view.mode==='strength'&&view.strength==='base'){
    body.append(editEffects(card,'effects','使用時',false));
    const secondary=el('details','','definition-secondary');secondary.open=Boolean(view.secondaryOpen);secondary.addEventListener('toggle',()=>{view.secondaryOpen=secondary.open;});secondary.append(el('summary','使用前・予約'));
    secondary.append(editEffects(card,'preEffects','使用前',false));secondary.append(editEffects(card,'reservedEffects','予約',false));body.append(secondary);
  }else body.append(renderVariants(card,types,changed));
  return box;
}


function renderConfiguration(card, entry, changed, editEffects, types) {
  ensureVariants(card);
  const box = el('div', '', 'configuration');
  const grid = el('div', '', 'variant-row');
  const config = { ...blankConfig(), ...entry };
  const update = (field, value) => {
    entry[field] = value;
    if (field === 'custom' && card.variants.customs.find(v => v.id === value)?.snapshot) entry.enhancement = '';
    changed();
  };
  grid.append(select('基本状態', [['base', '無印'], ['plus', '+']], config.base, v => update('base', v)));
  grid.append(select('カスタマイズ', [['', 'なし'], ...card.variants.customs.map(v => [v.id, v.snapshot ? v.name.replace(/^旧設定：/, '引継ぎ：') : v.name])], config.custom, v => update('custom', v)));
  const legacy = card.variants.customs.find(v => v.id === config.custom)?.snapshot;
  grid.append(select('追加強化', [['', 'なし'], ...(!legacy ? card.variants.enhancements.map(v => [v.id, `${v.name}${v.configured ? '' : '（未設定）'}`]) : [])], config.enhancement, v => update('enhancement', v)));
  if (entry.override) for (const input of grid.querySelectorAll('select')) input.disabled = true;
  box.append(grid);
  const resolved = resolveCard(card, entry);
  box.append(el('p', [...resolved.preEffects.map(e => ['使用前', e]), ...resolved.effects.map(e => ['本体', e]), ...resolved.reservedEffects.map(e => ['予約', e])]
    .filter(([, e]) => e.count !== 0).map(([prefix, e]) => `${prefix}：${types.find(t => t.value === e.type)?.label ?? e.type} ${e.value}${e.type === 'concScoreBoost' ? `％（${e.duration ?? 3}ターン${e.goodThreshold != null ? `・好調${e.goodThreshold}以下` : ''}）` : ''}${['score', 'goodScore'].includes(e.type) ? ` ×${e.count}回（集中${e.concRate}倍）` : ''}`).join(' / '), 'muted'));
  if (resolved.unconfigured) box.append(el('p', 'この追加強化は未設定です。カード定義で変更内容を入力してください。', 'error'));
  box.append(button(entry.override ? '個別編集を解除' : 'この手順だけ効果を編集', () => {
    if (entry.override) delete entry.override;
    else entry.override = { preEffects: resolved.preEffects, effects: resolved.effects, reservedEffects: resolved.reservedEffects, kind: resolved.kind, ljReaction: resolved.ljReaction };
    changed();
  }));
  if (entry.override) {
    box.append(editEffects(entry.override, 'preEffects', '個別の使用前処理'));
    box.append(editEffects(entry.override, 'effects', '個別の本体効果'));
    box.append(editEffects(entry.override, 'reservedEffects', '個別の予約効果'));
  }
  return box;
}

return {renderVariants, renderConfiguration, renderDefinition};
})();
