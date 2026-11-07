(() => {
  const library=document.getElementById('card-library');
  const rank=item=>item.querySelector('.kind-active')?0:item.querySelector('.kind-mental')?1:2;
  const libraryObserver=new MutationObserver(groupLibrary);
  function groupLibrary(){
    libraryObserver.disconnect();
    library.querySelectorAll('.review-library-heading').forEach(n=>n.remove());
    const items=[...library.querySelectorAll('.library-item')].sort((a,b)=>rank(a)-rank(b));
    let previous=-1;
    items.forEach(item=>{
      const kind=rank(item);
      if(previous!==kind){const heading=document.createElement('h3');heading.className='review-library-heading';heading.textContent=['アクティブ','メンタル','その他'][kind];library.append(heading);}
      item.setAttribute('aria-pressed',String(item.classList.contains('active')));
      library.append(item);previous=kind;
    });
    libraryObserver.observe(library,{childList:true});
  }
  groupLibrary();

  const desktop=matchMedia('(min-width:601px)');
  const grid=document.getElementById('turn-grid');
  const popup=document.createElement('div');popup.className='review-card-options';popup.id='review-card-options';popup.setAttribute('role','listbox');popup.hidden=true;document.body.append(popup);
  let current=null,active=0,choices=[],sequence=0,search='',searchAt=0;
  function close(restore=false){
    if(!current)return;
    const button=current.button;button.setAttribute('aria-expanded','false');button.removeAttribute('aria-activedescendant');popup.hidden=true;current=null;
    if(restore&&button.isConnected)button.focus();
  }
  function highlight(){
    [...popup.children].forEach((item,i)=>{item.classList.toggle('highlight',i===active);item.setAttribute('aria-selected',String(choices[i].value===current.select.value));});
    const row=popup.children[active];current.button.setAttribute('aria-activedescendant',row.id);const top=active*36;if(top<popup.scrollTop)popup.scrollTop=top;else if(top+36>popup.scrollTop+popup.clientHeight)popup.scrollTop=top+36-popup.clientHeight;
  }
  function choose(index){
    const {select,button}=current;select.value=choices[index].value;button.querySelector('span').textContent=choices[index].text;
    select.dispatchEvent(new Event('change',{bubbles:true}));close(true);
  }
  function open(select,button){
    close();choices=[...select.options].filter(o=>!o.disabled);if(!choices.length)return;
    current={select,button};active=Math.max(0,choices.findIndex(o=>o.value===select.value));
    popup.replaceChildren();popup.setAttribute('aria-label',select.getAttribute('aria-label')||'追加するカード');
    choices.forEach((option,i)=>{const row=document.createElement('div');row.id='review-card-option-'+(++sequence);row.setAttribute('role','option');row.textContent=option.text;row.addEventListener('mousedown',e=>e.preventDefault());row.addEventListener('click',()=>choose(i));popup.append(row);});
    const rect=button.getBoundingClientRect(),height=Math.min(choices.length,7)*36+2;
    popup.style.width=Math.min(Math.max(rect.width,220),innerWidth-16)+'px';
    popup.style.left=Math.max(8,Math.min(rect.left,innerWidth-parseFloat(popup.style.width)-8))+'px';
    const below=innerHeight-rect.bottom-8;
    const available=below>=height?below:Math.max(below,rect.top-8);
    const actual=Math.max(38,Math.min(height,available));popup.style.maxHeight=actual+'px';
    popup.style.top=(below>=height||below>=rect.top-8?rect.bottom+4:Math.max(8,rect.top-actual-4))+'px';
    popup.hidden=false;button.setAttribute('aria-expanded','true');highlight();
  }
  function install(){
    if(current&&!current.button.isConnected)close();
    grid.querySelectorAll('.turn-add select:not([data-review-picker])').forEach(select=>{
      select.dataset.reviewPicker='true';select.classList.add('review-native-card-select');
      const button=document.createElement('button');button.type='button';button.className='review-card-picker';button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-controls',popup.id);button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',select.getAttribute('aria-label')||'追加するカード');
      const name=document.createElement('span');name.textContent=select.selectedOptions[0]?.text||'';const arrow=document.createElement('span');arrow.textContent='▾';arrow.setAttribute('aria-hidden','true');button.append(name,arrow);select.after(button);
      select.addEventListener('change',()=>name.textContent=select.selectedOptions[0]?.text||'');
      button.addEventListener('click',()=>current?.button===button?close():open(select,button));
      button.addEventListener('keydown',e=>{
        if(e.key==='Tab'){close();return;}
        if(e.key==='Escape'){if(current){e.preventDefault();close(true);}return;}
        if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(e.key)){
          e.preventDefault();if(current?.button!==button){open(select,button);return;}
          if(e.key==='Enter'||e.key===' '){choose(active);return;}
          if(e.key==='Home')active=0;else if(e.key==='End')active=choices.length-1;else active=Math.max(0,Math.min(choices.length-1,active+(e.key==='ArrowDown'?1:-1)));highlight();
        }else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
          if(current?.button!==button)open(select,button);if(!current)return;
          search=Date.now()-searchAt>700?e.key:search+e.key;searchAt=Date.now();const found=choices.findIndex(o=>o.text.toLocaleLowerCase().startsWith(search.toLocaleLowerCase()));if(found>=0){active=found;highlight();}
        }
      });
    });
  }
  new MutationObserver(install).observe(grid,{childList:true,subtree:true});install();
  document.addEventListener('pointerdown',e=>{if(current&&!current.button.contains(e.target)&&!popup.contains(e.target))close();});
  document.addEventListener('scroll',e=>{if(current&&!popup.contains(e.target))close();},true);
  window.addEventListener('resize',()=>close());desktop.addEventListener('change',()=>close());
})();
