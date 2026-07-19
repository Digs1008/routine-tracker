// SCHEDULE
// ═══════════════════════════════════════════════════════════════════
function renderSchedule(){
  document.getElementById('routine-count').textContent=state.items.length+' items';
  const listEl=document.getElementById('schedule-list');
  document.getElementById('empty-schedule').style.display=state.items.length?'none':'block';
  if(!state.items.length){listEl.innerHTML='';return;}
  // Use stored order if present, else fall back to time-sort once
  const ordered=state.items;
  listEl.innerHTML='<div style="font-size:11px;color:var(--txt3);margin-bottom:8px;display:flex;align-items:center;gap:4px"><i class="ti ti-arrows-move" style="font-size:13px"></i> drag the handle to reorder</div>'
    +'<div class="routine-list" id="sortable-list">'+ordered.map((it,idx)=>{
    return '<div class="ri" id="ri-'+it.id+'" draggable="true" data-idx="'+idx+'" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="dragDrop(event)" ondragend="dragEnd(event)">'
      +'<div class="ichk" style="cursor:grab;border-color:transparent" title="drag to reorder"><i class="ti ti-grip-vertical" style="font-size:16px;color:var(--txt3)"></i></div>'
      +'<div class="ibody"><div class="iname">'+esc(it.name)+'</div>'
      +'<div class="imeta">'
      +'<span style="display:flex;align-items:center;gap:3px"><i class="ti ti-clock" style="font-size:11px"></i>'+(it.time||'–')+(it.duration?' · '+it.duration+'m':'')+'</span>'
      +'<span class="icat cat-'+(it.category||'personal')+'">'+(it.category||'personal')+'</span>'
      +'<span style="font-size:11px;color:var(--txt3)">'+(it.days||'everyday')+'</span>'
      +(it.goal?'<span class="gtag"><i class="ti ti-target"></i> '+esc(it.goal)+'</span>':'')
      +'<span style="font-size:11px;color:var(--txt3)"><i class="ti ti-bell" style="font-size:11px"></i> '+(it.remind||5)+'m</span>'
      +'</div></div>'
      +'<div class="iact">'
      +'<button onclick="toggleInlineEdit(&quot;'+it.id+'&quot;)" title="edit" style="width:28px;height:28px;border-radius:var(--r);border:.5px solid var(--bdr);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--txt2)"><i class="ti ti-edit"></i></button>'
      +'<button class="del" onclick="deleteItem(&quot;'+it.id+'&quot;)" title="delete" style="width:28px;height:28px;border-radius:var(--r);border:.5px solid var(--bdr);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--txt2)"><i class="ti ti-trash"></i></button>'
      +'</div></div>'
      +'<div id="edit-'+it.id+'" style="display:none;background:var(--bg2);border-radius:var(--r);padding:12px;margin:0 0 6px;border:.5px solid var(--bdr)"></div>';
  }).join('')+'</div>';
}
let _dragSrcIdx=null;
function dragStart(e){
  _dragSrcIdx=parseInt(e.currentTarget.dataset.idx);
  e.currentTarget.style.opacity='0.4';
  e.dataTransfer.effectAllowed='move';
}
function dragOver(e){e.preventDefault();return false;}
function dragDrop(e){
  e.preventDefault();
  const targetIdx=parseInt(e.currentTarget.dataset.idx);
  if(_dragSrcIdx===null||_dragSrcIdx===targetIdx)return;
  const items=[...state.items];
  const[moved]=items.splice(_dragSrcIdx,1);
  items.splice(targetIdx,0,moved);
  state.items=items;
  save();renderSchedule();showToast('Order updated ✓');
}
function dragEnd(e){e.currentTarget.style.opacity='1';_dragSrcIdx=null;}
function toggleInlineEdit(id){
  const el=document.getElementById('edit-'+id); if(!el)return;
  if(el.style.display!=='none'){el.style.display='none';return;}
  const it=state.items.find(i=>i.id===id); if(!it)return;
  const cats=['health','fitness','work','personal','meal','learning'];
  const dayOpts=['everyday','weekday','weekend','mon,wed,fri','tue,thu'];
  el.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
    +'<div><label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:3px">name</label>'
    +'<input id="ei-name-'+id+'" value="'+esc(it.name)+'" style="width:100%;padding:6px 8px;border-radius:var(--r);border:.5px solid var(--bdrm);background:var(--bg);font-size:13px;color:var(--txt);font-family:var(--font)"></div>'
    +'<div><label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:3px">time</label>'
    +'<input type="time" id="ei-time-'+id+'" value="'+(it.time||'07:00')+'" style="width:100%;padding:6px 8px;border-radius:var(--r);border:.5px solid var(--bdrm);background:var(--bg);font-size:13px;color:var(--txt);font-family:var(--font)"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">'
    +'<div><label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:3px">duration (min)</label>'
    +'<input type="number" id="ei-dur-'+id+'" value="'+(it.duration||20)+'" style="width:100%;padding:6px 8px;border-radius:var(--r);border:.5px solid var(--bdrm);background:var(--bg);font-size:13px;color:var(--txt);font-family:var(--font)"></div>'
    +'<div><label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:3px">category</label>'
    +'<select id="ei-cat-'+id+'" style="width:100%;padding:6px 8px;border-radius:var(--r);border:.5px solid var(--bdrm);background:var(--bg);font-size:13px;color:var(--txt);font-family:var(--font)">'+cats.map(c=>'<option '+(it.category===c?'selected':'')+'>'+c+'</option>').join('')+'</select></div>'
    +'<div><label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:3px">days</label>'
    +'<select id="ei-days-'+id+'" style="width:100%;padding:6px 8px;border-radius:var(--r);border:.5px solid var(--bdrm);background:var(--bg);font-size:13px;color:var(--txt);font-family:var(--font)">'+dayOpts.map(d=>'<option '+(it.days===d?'selected':'')+'>'+d+'</option>').join('')+'</select></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
    +'<div><label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:3px">goal / target</label>'
    +'<input id="ei-goal-'+id+'" value="'+esc(it.goal||'')+'" placeholder="e.g. 10,000 steps" style="width:100%;padding:6px 8px;border-radius:var(--r);border:.5px solid var(--bdrm);background:var(--bg);font-size:13px;color:var(--txt);font-family:var(--font)"></div>'
    +'<div><label style="font-size:11px;color:var(--txt2);display:block;margin-bottom:3px">remind (min before)</label>'
    +'<input type="number" id="ei-remind-'+id+'" value="'+(it.remind||5)+'" style="width:100%;padding:6px 8px;border-radius:var(--r);border:.5px solid var(--bdrm);background:var(--bg);font-size:13px;color:var(--txt);font-family:var(--font)"></div>'
    +'</div>'
    +'<div style="display:flex;gap:8px;justify-content:flex-end">'
    +'<button onclick="document.getElementById(&quot;edit-'+id+'&quot;).style.display=&quot;none&quot;" style="padding:6px 12px;border-radius:var(--r);border:.5px solid var(--bdrm);background:transparent;font-size:12px;cursor:pointer;color:var(--txt);font-family:var(--font)">cancel</button>'
    +'<button onclick="saveInlineEdit(&quot;'+id+'&quot;)" style="padding:6px 12px;border-radius:var(--r);border:.5px solid var(--teal);background:var(--teal);color:#fff;font-size:12px;cursor:pointer;font-family:var(--font)"><i class="ti ti-check"></i> save</button>'
    +'</div>';
  el.style.display='block';
}
function saveInlineEdit(id){
  const it=state.items.find(i=>i.id===id); if(!it)return;
  it.name    =document.getElementById('ei-name-'+id).value.trim()||it.name;
  it.time    =document.getElementById('ei-time-'+id).value;
  it.duration=parseInt(document.getElementById('ei-dur-'+id).value)||it.duration;
  it.category=document.getElementById('ei-cat-'+id).value;
  it.days    =document.getElementById('ei-days-'+id).value;
  it.goal    =document.getElementById('ei-goal-'+id).value.trim();
  it.remind  =parseInt(document.getElementById('ei-remind-'+id).value)||5;
  save();renderSchedule();showToast('Item updated ✓');
}
function toggleAddForm(){const f=document.getElementById('add-form-container');f.style.display=f.style.display==='none'?'block':'none';}
function addItem(){
  const name=document.getElementById('inp-name').value.trim();
  if(!name){alert('please enter a task name');return;}
  state.items.push({id:Date.now().toString(),name,time:document.getElementById('inp-time').value,duration:parseInt(document.getElementById('inp-dur').value)||20,category:document.getElementById('inp-cat').value,days:document.getElementById('inp-days').value,goal:document.getElementById('inp-goal').value.trim(),remind:parseInt(document.getElementById('inp-remind').value)||5});
  save();toggleAddForm();document.getElementById('inp-name').value='';document.getElementById('inp-goal').value='';renderSchedule();
}
function deleteItem(id){if(!confirm('delete?'))return;state.items=state.items.filter(i=>i.id!==id);save();renderSchedule();}
function clearAll(){
  if(!confirm('clear ALL routine items and history?')) return;
  const backup={items:JSON.parse(JSON.stringify(state.items)),completions:{...state.completions},workLogs:JSON.parse(JSON.stringify(state.workLogs))};
  state.items=[];state.completions={};state.workLogs={};state.filterCat='all';save();
  renderSchedule();renderToday();
  let secs=5;
  const tick=()=>{const t=document.getElementById('toast-el');if(!t)return;t.innerHTML='All cleared — <span onclick="undoClear()" style="text-decoration:underline;cursor:pointer;font-weight:600">UNDO ('+secs+'s)</span>';t.style.opacity='1';};
  window._clearBackup=backup;tick();
  const iv=setInterval(()=>{secs--;if(secs<=0){clearInterval(iv);const t=document.getElementById('toast-el');if(t)t.style.opacity='0';window._clearBackup=null;}else tick();},1000);
  window._clearTimer=iv;
}
function undoClear(){
  if(!window._clearBackup)return;clearInterval(window._clearTimer);
  state.items=window._clearBackup.items;state.completions=window._clearBackup.completions;state.workLogs=window._clearBackup.workLogs;
  window._clearBackup=null;save();renderSchedule();renderToday();showToast('Undo successful ✓');
}
function handleFileSelect(e){processFile(e.target.files[0]);}
function handleDrop(e){e.preventDefault();document.getElementById('upload-zone').classList.remove('drag');processFile(e.dataTransfer.files[0]);}
function normTime(raw){if(!raw&&raw!==0)return '';if(typeof raw==='number'){const t=Math.round(raw*24*60);return p2(Math.floor(t/60))+':'+p2(t%60);}const s=raw.toString().trim();return /^\d{1,2}:\d{2}/.test(s)?s.substring(0,5):s;}
function normDays(raw){if(!raw)return 'everyday';const s=raw.toString().toLowerCase().trim();if(s==='everyday'||s==='daily')return 'everyday';if(s==='weekday'||s==='weekdays')return 'weekday';if(s==='weekend'||s==='weekends')return 'weekend';return s;}
function normCat(raw){return raw?raw.toString().toLowerCase().trim():'personal';}
function rowsToItems(header,data){
  const fi=(...ns)=>{for(const n of ns){const i=header.findIndex(h=>h.includes(n));if(i>=0)return i;}return -1;};
  const ni=fi('name'),ti=fi('time'),di=fi('dur'),ci=fi('cat'),dayi=fi('day'),gi=fi('goal'),ri=fi('remind');
  return data.map(r=>{const name=(ni>=0?r[ni]:r[0]||'').toString().trim();if(!name)return null;return{id:(Date.now()+Math.random()).toString(36),name,time:normTime(ti>=0?r[ti]:''),duration:di>=0?(parseInt(r[di])||20):20,category:normCat(ci>=0?r[ci]:'personal'),days:normDays(dayi>=0?r[dayi]:'everyday'),goal:gi>=0?(r[gi]||'').toString():'',remind:ri>=0?(parseInt(r[ri])||5):5};}).filter(Boolean);
}
function processFile(file){
  if(!file)return;
  const ext=file.name.split('.').pop().toLowerCase();
  if(ext==='csv'){const r=new FileReader();r.onload=e=>{const rows=e.target.result.split('\n').map(r=>r.split(',').map(c=>c.trim().replace(/^"|"$/g,'')));showPreview(rowsToItems(rows[0].map(h=>h.toLowerCase()),rows.slice(1).filter(r=>r.length>1&&r[0])));};r.readAsText(file);}
  else{const r=new FileReader();r.onload=e=>{const wb=XLSX.read(e.target.result,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:true});if(!rows.length)return;showPreview(rowsToItems(rows[0].map(h=>(h||'').toString().toLowerCase().trim()),rows.slice(1).filter(r=>r.length>0&&r[0])));};r.readAsArrayBuffer(file);}
}
function showPreview(items){
  state.pendingImport=items;
  document.getElementById('preview-list').innerHTML=items.map(it=>`
    <div class="ri">
      <div class="ichk" style="cursor:default;border-color:transparent"><i class="ti ti-table" style="font-size:14px;color:var(--teal)"></i></div>
      <div class="ibody"><div class="iname">${esc(it.name)}</div>
        <div class="imeta">
          <span>${it.time||'–'} · ${it.duration}m</span>
          <span class="icat cat-${it.category}">${it.category}</span>
          <span style="font-size:11px;color:var(--txt3)">${it.days}</span>
          ${it.goal?`<span class="gtag"><i class="ti ti-target"></i> ${esc(it.goal)}</span>`:''}
        </div>
      </div>
    </div>`).join('');
  document.getElementById('import-preview').style.display=items.length?'block':'none';
  if(!items.length)alert('no valid rows found.');
}
function confirmImport(){state.items.push(...state.pendingImport);state.pendingImport=[];save();document.getElementById('import-preview').style.display='none';document.getElementById('file-input').value='';alert('imported! '+state.items.length+' total items.');showView('schedule');}
function cancelImport(){state.pendingImport=[];document.getElementById('import-preview').style.display='none';}

// ═══════════════════════════════════════════════════════════════════
