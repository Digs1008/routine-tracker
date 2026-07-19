// REPORTS
// ═══════════════════════════════════════════════════════════════════
let charts={};
function renderReports(){
  const today=todayStr();
  const n=state.reportPeriod==='week'?7:state.reportPeriod==='month'?30:90;
  const days=Array.from({length:n},(_,i)=>addDays(today,-(n-1-i)));
  const adDays=days.map(d=>({d,a:getAdherence(d)})).filter(x=>x.a!==null);
  const avg=adDays.length?Math.round(adDays.reduce((s,x)=>s+x.a,0)/adDays.length):0;
  const best=adDays.length?adDays.reduce((b,x)=>x.a>b.a?x:b,adDays[0]):null;

  document.getElementById('report-metrics').innerHTML=`
    <div class="mc"><div class="ml">avg adherence</div><div class="mv ${avg>=80?'green':avg>=50?'amber':'red'}">${avg}%</div></div>
    <div class="mc"><div class="ml">streak</div><div class="mv green">${calcStreak()}d</div></div>
    <div class="mc"><div class="ml">tasks</div><div class="mv">${state.items.length}</div></div>
    <div class="mc"><div class="ml">best day</div><div class="mv green">${best?best.a+'%':'—'}</div></div>`;

  const hm=Array.from({length:28},(_,i)=>addDays(today,-(27-i)));
  document.getElementById('streak-bar').innerHTML=hm.map(d=>{
    const a=getAdherence(d),dd=parseDate(d).getDate();
    const cls=a===null?'missed':a===100?'full':a>=50?'partial':'missed';
    return `<div class="sd ${cls} ${d===today?'today':''}" title="${d}: ${a===null?'no tasks':a+'%'}">${dd}</div>`;
  }).join('');

  const catTot={},catDone={};
  days.forEach(d=>state.items.filter(i=>dayApplies(i,d)).forEach(i=>{
    const c=i.category||'personal';catTot[c]=(catTot[c]||0)+1;
    if(isCompleted(i.id,d))catDone[c]=(catDone[c]||0)+1;
  }));

  const taskStats=state.items.map(it=>{
    let miss=0,tot=0;
    days.forEach(d=>{if(dayApplies(it,d)){tot++;if(!isCompleted(it.id,d))miss++;}});
    return{name:it.name,miss,tot,pct:tot?Math.round((tot-miss)/tot*100):0};
  });

  document.getElementById('task-bars').innerHTML=taskStats.sort((a,b)=>b.pct-a.pct).map(t=>`
    <div class="pr">
      <div class="pl" title="${esc(t.name)}">${esc(t.name)}</div>
      <div class="pbg"><div class="pfill" style="width:${t.pct}%;background:${t.pct>=80?'#1D9E75':t.pct>=50?'#BA7517':'#E24B4A'}"></div></div>
      <div class="ppct" style="color:${t.pct>=80?'#1D9E75':t.pct>=50?'#BA7517':'#E24B4A'}">${t.pct}%</div>
    </div>`).join('')||'<p style="font-size:13px;color:var(--txt2)">start completing tasks</p>';

  document.getElementById('skipped-tasks').innerHTML=taskStats.filter(t=>t.tot>0).sort((a,b)=>b.miss-a.miss).slice(0,6).map(t=>`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:13px">
      <span>${esc(t.name)}</span><span style="color:var(--red);font-weight:600">${t.miss} skipped</span>
    </div>`).join('')||'<p style="font-size:13px;color:var(--txt2)">no data yet</p>';

  renderNutritionTrends();
  renderMoMComparison();

  ['adh','cat'].forEach(k=>{if(charts[k]){try{charts[k].destroy();}catch(e){}delete charts[k];}});
  const ctx1=document.getElementById('chart-adh');
  if(ctx1&&adDays.length)charts['adh']=new Chart(ctx1,{type:'line',data:{labels:adDays.map(x=>{const d=parseDate(x.d);return d.getDate()+' '+MONTHS[d.getMonth()];}),datasets:[{label:'%',data:adDays.map(x=>x.a),borderColor:'#1D9E75',backgroundColor:'rgba(29,158,117,.08)',tension:.35,fill:true,pointRadius:3,pointBackgroundColor:'#1D9E75'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%',font:{size:11}},grid:{color:'rgba(128,128,128,.1)'}},x:{ticks:{maxTicksLimit:10,font:{size:11}},grid:{display:false}}}}});
  const cats=Object.keys(catTot).filter(c=>catTot[c]>0);
  const ctx2=document.getElementById('chart-cat');
  if(ctx2&&cats.length)charts['cat']=new Chart(ctx2,{type:'doughnut',data:{labels:cats,datasets:[{data:cats.map(c=>catTot[c]?Math.round((catDone[c]||0)/catTot[c]*100):0),backgroundColor:cats.map(c=>CAT_COLORS[c]||'#888'),borderWidth:2,borderColor:'transparent'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'58%',plugins:{legend:{position:'right',labels:{font:{size:11},boxWidth:10,padding:6}}}}});
}
function setRP(p,btn){state.reportPeriod=p;document.querySelectorAll('.tgl').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderReports();}

// ═══════════════════════════════════════════════════════════════════
