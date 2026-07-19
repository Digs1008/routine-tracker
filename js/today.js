function renderToday(){
  const d=state.currentDate;
  document.getElementById('today-label').textContent=fmtDate(d)+(d===todayStr()?' — today':'');
  const allItems=state.items.filter(i=>dayApplies(i,d));
  const filtered=state.filterCat==='all'?allItems:allItems.filter(i=>i.category===state.filterCat);
  const done=allItems.filter(i=>isCompleted(i.id,d)).length;
  const adh=allItems.length?Math.round(done/allItems.length*100):0;
  const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  const remaining=allItems.length-done;
  const donePct=allItems.length?Math.round(done/allItems.length*100):0;
  const remainingPct=allItems.length?Math.round(remaining/allItems.length*100):0;

  document.getElementById('metrics-row').innerHTML=`
    <div class="today-overview">
      <div class="today-progress-ring" style="--pct:${adh};--ring:${adh>=80?'var(--teal)':adh>=50?'var(--amb)':'var(--red)'}">
        <div><strong>${adh}%</strong><span>adherence</span></div>
      </div>
      <div class="today-stat-grid">
        <div class="today-stat"><span>Tasks</span><strong>${allItems.length}</strong></div>
        <div class="today-stat done"><span>Done</span><strong>${done}</strong><b style="width:${donePct}%"></b></div>
        <div class="today-stat remaining"><span>Remaining</span><strong>${remaining}</strong><b style="width:${remainingPct}%"></b></div>
      </div>
    </div>`;

  document.getElementById('flag-container').innerHTML='';
  document.getElementById('overdue-container').innerHTML='';

  const cats=[...new Set(state.items.map(i=>i.category))].sort();
  document.getElementById('cat-filter').innerHTML=
    `<button class="cat-btn ${state.filterCat==='all'?'active':''}" onclick="setCatFilter('all')">all</button>`
    +cats.map(c=>`<button class="cat-btn ${state.filterCat===c?'active':''}" onclick="setCatFilter('${c}')">${c}</button>`).join('');

  const sorted=[...filtered].sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const listEl=document.getElementById('today-list');
  document.getElementById('empty-today').style.display=sorted.length?'none':'block';
  if(!sorted.length){listEl.innerHTML='';return;}
  const groups={};
  sorted.forEach(it=>{const h=it.time?parseInt(it.time):0;const g=h<12?'morning':h<17?'afternoon':'evening';if(!groups[g])groups[g]=[];groups[g].push(it);});
  listEl.innerHTML=Object.entries(groups).map(([grp,gi])=>`
    <div class="tg"><div class="tgh">${grp}</div>${gi.map(it=>renderItem(it,d,nowMin)).join('')}</div>`).join('');
}

function renderItem(it,d,nowMin){
  const done=isCompleted(it.id,d),skip=wasSkippedYesterday(it.id,d)&&!done;
  const[ih,im]=(it.time||'00:00').split(':').map(Number),od=d===todayStr()&&ih*60+im<nowMin&&!done;
  const stateIcon=done?'ti-check':od?'ti-clock-exclamation':skip?'ti-alert-triangle':'ti-circle';
  return `<div class="ri today-task ${done?'done':''} ${skip?'fskip':''} ${od?'fover':''}" title="${esc(it.name)}">
    <div class="ichk ${done?'dn':''}" onclick="toggleComplete('${it.id}','${d}')">${done?'<i class="ti ti-check"></i>':''}</div>
    <div class="ibody">
      <div class="today-task-main"><div class="iname"><i class="ti ${stateIcon}"></i>${esc(it.name)}</div><span class="today-time">${it.time||'–'}${it.duration?' · '+it.duration+'m':''}</span></div>
      <div class="imeta">
        <span class="icat cat-${it.category||'personal'}">${it.category||'personal'}</span>
        ${it.goal?`<span class="gtag"><i class="ti ti-target"></i> ${esc(it.goal)}</span>`:''}
      </div>
    </div>
    <div class="iact"><button onclick="toggleComplete('${it.id}','${d}')" title="${done?'undo':'done'}"><i class="ti ti-${done?'rotate-clockwise':'circle-check'}"></i></button></div>
  </div>`;
}
function setCatFilter(c){state.filterCat=c;renderToday();}

// ═══════════════════════════════════════════════════════════════════
