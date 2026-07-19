// WORK LOG
// ═══════════════════════════════════════════════════════════════════
function addTaskChip(){
  const inp=document.getElementById('task-inp');
  const val=inp.value.trim();
  if(!val)return;
  state.taskChips.push(val);
  inp.value='';
  renderTaskChips();
}
document.getElementById('task-inp').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addTaskChip();}});

function removeTaskChip(i){state.taskChips.splice(i,1);renderTaskChips();}
function renderTaskChips(){
  document.getElementById('task-chips').innerHTML=state.taskChips.map((t,i)=>
    `<span class="task-chip">${esc(t)}<span class="rm" onclick="removeTaskChip(${i})">✕</span></span>`).join('');
}

function saveWorkEntry(){
  const note=document.getElementById('work-note').value.trim();
  const tasks=[...state.taskChips];
  if(!tasks.length&&!note){alert('please add at least one task or a note');return;}
  const d=state.workDate;
  if(!state.workLogs[d])state.workLogs[d]=[];
  // Edit mode
  if(state.editingWorkEntry){
    const {d:ed,id}=state.editingWorkEntry;
    const idx=(state.workLogs[ed]||[]).findIndex(e=>e.id===id);
    if(idx>=0){state.workLogs[ed][idx].tasks=tasks;state.workLogs[ed][idx].note=note;}
    state.editingWorkEntry=null;
    document.getElementById('work-save-btn').innerHTML='<i class="ti ti-device-floppy"></i> save entry';
  } else {
    state.workLogs[d].push({id:Date.now().toString(),tasks,note,time:new Date().toTimeString().slice(0,5)});
  }
  state.taskChips=[];
  document.getElementById('work-note').value='';
  renderTaskChips();
  save();renderWork();
  showToast('Work entry saved ✓');
}

function deleteWorkEntry(d,id){
  if(!confirm('delete this entry?'))return;
  state.workLogs[d]=state.workLogs[d].filter(e=>e.id!==id);
  save();renderWork();
}

function renderWork(){
  const d=state.workDate;
  document.getElementById('work-label').textContent=fmtDate(d)+(d===todayStr()?' — today':'');
  const query=(document.getElementById('work-search')?.value||'').toLowerCase().trim();
  let entriesToShow=[];
  if(query){
    // Search across all dates
    Object.entries(state.workLogs).sort((a,b)=>b[0].localeCompare(a[0])).forEach(([date,entries])=>{
      entries.forEach(e=>{
        if(e.tasks.some(t=>t.toLowerCase().includes(query))||(e.note||'').toLowerCase().includes(query)){
          entriesToShow.push({date,e});
        }
      });
    });
  }else{
    (state.workLogs[d]||[]).forEach(e=>entriesToShow.push({date:d,e}));
  }
  const el=document.getElementById('work-entries');
  document.getElementById('empty-work').style.display=entriesToShow.length?'none':'block';
  el.innerHTML=entriesToShow.map(({date,e})=>{
    const dateTag=query?'<span style="font-size:11px;color:var(--teal);margin-left:4px">'+fmtShort(date)+'</span>':'';
    return '<div class="wlog-entry">'
      +'<div class="wlog-header"><span class="wlog-time"><i class="ti ti-clock" style="font-size:11px"></i> '+(e.time||'')+dateTag+'</span>'
      +'<div style="display:flex;gap:5px">'
      +'<button class="btn sm" onclick="editWorkEntry(&quot;'+date+'&quot;,&quot;'+e.id+'&quot;)" style="width:26px;height:26px;padding:0;display:flex;align-items:center;justify-content:center"><i class="ti ti-edit" style="font-size:13px"></i></button>'
      +'<button class="btn sm del" onclick="deleteWorkEntry(&quot;'+date+'&quot;,&quot;'+e.id+'&quot;)" style="width:26px;height:26px;padding:0;display:flex;align-items:center;justify-content:center;border-color:transparent"><i class="ti ti-trash" style="font-size:13px;color:var(--txt3)"></i></button>'
      +'</div></div>'
      +(e.tasks.length?'<div class="wlog-tasks">'+e.tasks.map(t=>'<span class="wlog-task">'+esc(t)+'</span>').join('')+'</div>':'')
      +(e.note?'<div class="wlog-note">'+esc(e.note).replace(/\n/g,'<br>')+'</div>':'')
      +'</div>';
  }).join('');
}
function renderSummary(){
  const d=state.summaryDate;
  document.getElementById('summary-label').textContent=fmtDate(d)+(d===todayStr()?' — today':'');

  const allItems=state.items.filter(i=>dayApplies(i,d));
  const doneItems=allItems.filter(i=>isCompleted(i.id,d));
  const missedItems=allItems.filter(i=>!isCompleted(i.id,d));
  const adh=allItems.length?Math.round(doneItems.length/allItems.length*100):0;
  const workEntries=state.workLogs[d]||[];
  const allTasks=workEntries.flatMap(e=>e.tasks);
  const allNotes=workEntries.map(e=>e.note).filter(Boolean);
  const meals=state.mealLogs[d]||[];
  const exercises=state.exerciseLogs[d]||[];
  const settings=getSettings();
  const mealTotals=meals.reduce((a,e)=>({cal:a.cal+(e.cal||0),protein:a.protein+(e.protein||0),carbs:a.carbs+(e.carbs||0),fat:a.fat+(e.fat||0)}),{cal:0,protein:0,carbs:0,fat:0});
  const exerciseTotals=exercises.reduce((a,e)=>({minutes:a.minutes+(parseFloat(e.duration)||0),calories:a.calories+(e.calories||0),sessions:a.sessions+1}),{minutes:0,calories:0,sessions:0});
  const nutritionScore=meals.length?Math.round((Math.min(mealTotals.cal/settings.calTarget,1)*.45+Math.min(mealTotals.protein/settings.proteinTarget,1)*.55)*100):0;
  const exerciseScore=Math.min(100,Math.round((exerciseTotals.minutes/30)*100));
  const workScore=Math.min(100,allTasks.length*25+allNotes.length*10);
  const reviewScore=Math.round(adh*.45+nutritionScore*.25+exerciseScore*.2+workScore*.1);

  const wins=[];
  const risks=[];
  const focus=[];
  if(adh>=80)wins.push(`${doneItems.length} of ${allItems.length} routine items completed.`);
  else if(doneItems.length)wins.push(`${doneItems.length} routine items completed despite an incomplete day.`);
  if(meals.length)wins.push(`${meals.length} meal logs captured with ${Math.round(mealTotals.protein)}g protein.`);
  if(exerciseTotals.sessions)wins.push(`${exerciseTotals.sessions} exercise session${exerciseTotals.sessions>1?'s':''} logged for ${Math.round(exerciseTotals.minutes)} minutes.`);
  if(allTasks.length)wins.push(`${allTasks.length} work task${allTasks.length>1?'s':''} recorded.`);
  if(!wins.length)wins.push('Some data is missing, but the review gives a clean reset point.');

  if(missedItems.length)risks.push(`${missedItems.length} routine item${missedItems.length>1?'s were':' was'} missed.`);
  if(!meals.length)risks.push('No meals logged, so nutrition insight is incomplete.');
  else{
    if(mealTotals.protein<settings.proteinTarget*.75)risks.push(`Protein is under target by about ${Math.max(0,Math.round(settings.proteinTarget-mealTotals.protein))}g.`);
    if(mealTotals.cal>settings.calTarget*1.1)risks.push(`Calories are above target by about ${Math.round(mealTotals.cal-settings.calTarget)} kcal.`);
    if(mealTotals.cal<settings.calTarget*.7)risks.push('Calories look low versus target; check whether meals were missed in logging.');
  }
  if(!exerciseTotals.sessions)risks.push('No exercise logged for the day.');
  if(!allTasks.length&&!allNotes.length)risks.push('No work output captured, so the productivity picture is thin.');
  if(!risks.length)risks.push('No major risk stands out from today\'s logged data.');

  if(missedItems.length)focus.push(`Recover the first missed routine: ${esc(missedItems[0].name)}.`);
  if(meals.length&&mealTotals.protein<settings.proteinTarget)focus.push(`Plan one protein add-on tomorrow, about ${Math.max(10,Math.round(settings.proteinTarget-mealTotals.protein))}g.`);
  if(!meals.length)focus.push('Log at least breakfast and lunch tomorrow to make nutrition trends useful.');
  if(!exerciseTotals.sessions)focus.push('Schedule one 20-30 minute movement block.');
  if(allTasks.length<2)focus.push('Capture two concrete work outcomes before end of day.');
  if(!focus.length)focus.push('Repeat the same structure tomorrow and protect the first routine block.');

  const summaryText=buildSummaryText(d,doneItems,missedItems,adh,allTasks,allNotes,mealTotals,exerciseTotals,reviewScore,wins,risks,focus);

  document.getElementById('summary-content').innerHTML=`
    <div class="review-hero summary-block">
      <div>
        <div class="review-kicker">daily review score</div>
        <div class="review-score">${reviewScore}</div>
        <div class="review-score-label">${reviewScore>=80?'Strong day':reviewScore>=55?'Useful progress':'Needs a reset'}</div>
      </div>
      <div class="review-hero-copy">
        <h3><i class="ti ti-file-analytics" style="color:var(--teal)"></i> review, not coaching
        <button class="copy-btn" onclick="copySummary('${d}')"><i class="ti ti-copy"></i> copy</button>
        </h3>
        <p>Summary turns today's logs into an end-of-day scorecard. Coach stays responsible for deeper guidance, motivation, and long-range patterns.</p>
      </div>
    </div>

    <div class="review-grid">
      <div class="summary-section review-panel win">
        <h4><i class="ti ti-trophy"></i> wins</h4>
        ${wins.slice(0,4).map(w=>`<div class="review-line"><i class="ti ti-check"></i><span>${w}</span></div>`).join('')}
      </div>
      <div class="summary-section review-panel risk">
        <h4><i class="ti ti-alert-triangle"></i> risks</h4>
        ${risks.slice(0,4).map(r=>`<div class="review-line"><i class="ti ti-alert-circle"></i><span>${r}</span></div>`).join('')}
      </div>
      <div class="summary-section review-panel focus">
        <h4><i class="ti ti-target-arrow"></i> tomorrow's focus</h4>
        ${focus.slice(0,4).map(f=>`<div class="review-line"><i class="ti ti-arrow-right"></i><span>${f}</span></div>`).join('')}
      </div>
    </div>

    <div class="review-metric-grid">
      <div class="review-metric"><span>routine</span><strong>${adh}%</strong><small>${doneItems.length}/${allItems.length} done</small></div>
      <div class="review-metric"><span>nutrition</span><strong>${Math.round(mealTotals.cal)}</strong><small>${Math.round(mealTotals.protein)}g protein</small></div>
      <div class="review-metric"><span>exercise</span><strong>${Math.round(exerciseTotals.minutes)}</strong><small>${exerciseTotals.sessions} sessions</small></div>
      <div class="review-metric"><span>work</span><strong>${allTasks.length}</strong><small>${allNotes.length} notes</small></div>
    </div>

    <div class="summary-block review-evidence">
      <h3><i class="ti ti-list-details" style="color:var(--teal)"></i> evidence</h3>
      <div class="review-evidence-grid">
        <div class="summary-section"><h4><i class="ti ti-checklist"></i> routines</h4>${doneItems.slice(0,5).map(i=>`<div class="review-mini good">${esc(i.name)}</div>`).join('')||'<div class="review-muted">No routines completed.</div>'}${missedItems.slice(0,4).map(i=>`<div class="review-mini miss">${esc(i.name)}</div>`).join('')}</div>
        <div class="summary-section"><h4><i class="ti ti-salad"></i> nutrition</h4><div class="review-muted">${meals.length?`${meals.length} entries, ${Math.round(mealTotals.cal)} kcal, ${Math.round(mealTotals.protein)}g protein, ${Math.round(mealTotals.carbs)}g carbs, ${Math.round(mealTotals.fat)}g fat.`:'No meals logged.'}</div></div>
        <div class="summary-section"><h4><i class="ti ti-run"></i> exercise</h4><div class="review-muted">${exercises.length?`${exerciseTotals.sessions} sessions, ${Math.round(exerciseTotals.minutes)} minutes, ${Math.round(exerciseTotals.calories)} kcal burned.`:'No exercise logged.'}</div></div>
        <div class="summary-section"><h4><i class="ti ti-briefcase"></i> work</h4>${allTasks.slice(0,6).map(t=>`<div class="review-mini">${esc(t)}</div>`).join('')||'<div class="review-muted">No work tasks logged.</div>'}</div>
      </div>
      <div class="review-generated">Generated ${new Date().toLocaleString()}</div>
    </div>`;

  // Weekly report
  renderWeeklySummary();
}

function buildSummaryText(d,doneItems,missedItems,adh,tasks,notes,mealTotals,exerciseTotals,reviewScore,wins,risks,focus){
  let t=`DAILY REVIEW - ${fmtDate(d)}\n${'-'.repeat(40)}\n\n`;
  t+=`REVIEW SCORE: ${reviewScore}/100\n`;
  t+=`ROUTINE: ${adh}% (${doneItems.length}/${doneItems.length+missedItems.length})\n`;
  t+=`NUTRITION: ${Math.round(mealTotals.cal)} kcal, ${Math.round(mealTotals.protein)}g protein\n`;
  t+=`EXERCISE: ${Math.round(exerciseTotals.minutes)} minutes, ${exerciseTotals.sessions} sessions\n`;
  t+=`WORK: ${tasks.length} tasks, ${notes.length} notes\n\n`;
  t+=`WINS:\n`;wins.forEach(x=>t+=`  - ${x}\n`);t+='\n';
  t+=`RISKS:\n`;risks.forEach(x=>t+=`  - ${x}\n`);t+='\n';
  t+=`TOMORROW'S FOCUS:\n`;focus.forEach(x=>t+=`  - ${x}\n`);t+='\n';
  if(tasks.length){t+=`WORK TASKS:\n`;tasks.forEach(tk=>t+=`  - ${tk}\n`);t+='\n';}
  if(notes.length){t+=`NOTES:\n`;notes.forEach(n=>t+=`  ${n}\n`);t+='\n';}
  return t;
}

function copySummary(d){
  const allItems=state.items.filter(i=>dayApplies(i,d));
  const doneItems=allItems.filter(i=>isCompleted(i.id,d));
  const missedItems=allItems.filter(i=>!isCompleted(i.id,d));
  const adh=allItems.length?Math.round(doneItems.length/allItems.length*100):0;
  const workEntries=state.workLogs[d]||[];
  const allTasks=workEntries.flatMap(e=>e.tasks);
  const allNotes=workEntries.map(e=>e.note).filter(Boolean);
  const meals=state.mealLogs[d]||[];
  const exercises=state.exerciseLogs[d]||[];
  const settings=getSettings();
  const mealTotals=meals.reduce((a,e)=>({cal:a.cal+(e.cal||0),protein:a.protein+(e.protein||0),carbs:a.carbs+(e.carbs||0),fat:a.fat+(e.fat||0)}),{cal:0,protein:0,carbs:0,fat:0});
  const exerciseTotals=exercises.reduce((a,e)=>({minutes:a.minutes+(parseFloat(e.duration)||0),calories:a.calories+(e.calories||0),sessions:a.sessions+1}),{minutes:0,calories:0,sessions:0});
  const nutritionScore=meals.length?Math.round((Math.min(mealTotals.cal/settings.calTarget,1)*.45+Math.min(mealTotals.protein/settings.proteinTarget,1)*.55)*100):0;
  const exerciseScore=Math.min(100,Math.round((exerciseTotals.minutes/30)*100));
  const workScore=Math.min(100,allTasks.length*25+allNotes.length*10);
  const reviewScore=Math.round(adh*.45+nutritionScore*.25+exerciseScore*.2+workScore*.1);
  const wins=[`${doneItems.length} routine items completed.`,`${meals.length} meal entries logged.`,`${exerciseTotals.sessions} exercise sessions logged.`,`${allTasks.length} work tasks recorded.`].filter(x=>!/\\b0\\b/.test(x));
  const risks=[];
  if(missedItems.length)risks.push(`${missedItems.length} routine items missed.`);
  if(!meals.length)risks.push('No meals logged.');
  if(!exerciseTotals.sessions)risks.push('No exercise logged.');
  if(!allTasks.length&&!allNotes.length)risks.push('No work output captured.');
  if(!risks.length)risks.push("No major risk stands out from today's logged data.");
  const focus=[];
  if(missedItems.length)focus.push(`Recover the first missed routine: ${missedItems[0].name}.`);
  if(mealTotals.protein<settings.proteinTarget)focus.push(`Plan one protein add-on tomorrow, about ${Math.max(10,Math.round(settings.proteinTarget-mealTotals.protein))}g.`);
  if(!exerciseTotals.sessions)focus.push('Schedule one 20-30 minute movement block.');
  if(allTasks.length<2)focus.push('Capture two concrete work outcomes before end of day.');
  if(!focus.length)focus.push('Repeat the same structure tomorrow.');
  const txt=buildSummaryText(d,doneItems,missedItems,adh,allTasks,allNotes,mealTotals,exerciseTotals,reviewScore,wins,risks,focus);
  navigator.clipboard.writeText(txt).then(()=>alert('copied to clipboard!')).catch(()=>alert('copy failed — please select text manually'));
}

function renderWeeklySummary(){
  const today=todayStr();
  const days=Array.from({length:7},(_,i)=>addDays(today,-(6-i)));
  let html=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
    <tr style="border-bottom:.5px solid var(--bdr)">
      <th style="text-align:left;padding:6px 8px;color:var(--txt2);font-weight:600">day</th>
      <th style="text-align:center;padding:6px 8px;color:var(--txt2);font-weight:600">routine</th>
      <th style="text-align:center;padding:6px 8px;color:var(--txt2);font-weight:600">tasks logged</th>
      <th style="text-align:center;padding:6px 8px;color:var(--txt2);font-weight:600">adherence</th>
    </tr>`;
  days.forEach(d=>{
    const allItems=state.items.filter(i=>dayApplies(i,d));
    const done=allItems.filter(i=>isCompleted(i.id,d)).length;
    const adh=allItems.length?Math.round(done/allItems.length*100):null;
    const tasks=(state.workLogs[d]||[]).flatMap(e=>e.tasks).length;
    const pd=parseDate(d),isT=d===today;
    const col=adh===null?'var(--txt3)':adh>=80?'var(--teal)':adh>=50?'var(--amb)':'var(--red)';
    html+=`<tr style="border-bottom:.5px solid var(--bdr);${isT?'background:var(--tl);':''}">
      <td style="padding:7px 8px;font-weight:${isT?'600':'400'}">${SHORTDAY[pd.getDay()].toUpperCase()} ${pd.getDate()}</td>
      <td style="text-align:center;padding:7px 8px">${done}/${allItems.length}</td>
      <td style="text-align:center;padding:7px 8px">${tasks||'—'}</td>
      <td style="text-align:center;padding:7px 8px;font-weight:600;color:${col}">${adh!==null?adh+'%':'—'}</td>
    </tr>`;
  });
  html+=`</table></div>
  <button class="copy-btn" style="margin-top:10px" onclick="copyWeeklyReport()"><i class="ti ti-copy"></i> copy weekly report</button>`;
  document.getElementById('weekly-summary').innerHTML=html;
}

function copyWeeklyReport(){
  const today=todayStr();
  const days=Array.from({length:7},(_,i)=>addDays(today,-(6-i)));
  let txt=`WEEKLY REPORT — w/e ${fmtDate(today)}\n${'─'.repeat(40)}\n\n`;
  days.forEach(d=>{
    const allItems=state.items.filter(i=>dayApplies(i,d));
    const done=allItems.filter(i=>isCompleted(i.id,d)).length;
    const adh=allItems.length?Math.round(done/allItems.length*100):null;
    const tasks=(state.workLogs[d]||[]).flatMap(e=>e.tasks);
    const pd=parseDate(d);
    txt+=`${FULLDAY[pd.getDay()]} ${pd.getDate()} ${MONTHS[pd.getMonth()]}\n`;
    txt+=`  Routine: ${done}/${allItems.length} (${adh!==null?adh+'%':'no tasks'})\n`;
    if(tasks.length)txt+=`  Work: ${tasks.join(', ')}\n`;
    txt+='\n';
  });
  navigator.clipboard.writeText(txt).then(()=>alert('copied!')).catch(()=>alert('copy failed'));
}

// ═══════════════════════════════════════════════════════════════════
// AI COACH
// ═══════════════════════════════════════════════════════════════════
function renderCoach(){
  renderDailyMotivation();
  renderHabitCorrelations();
  renderGoalProgress();
  renderPatternInsights();
}

function renderDailyMotivation(){
  const d=todayStr();
  const allItems=state.items.filter(i=>dayApplies(i,d));
  const done=allItems.filter(i=>isCompleted(i.id,d)).length;
  const adh=allItems.length?Math.round(done/allItems.length*100):0;
  const streak=calcStreak();
  const msg=getDailyMotivation(adh,streak,done,allItems.length);
  document.getElementById('ai-daily-card').innerHTML=`
    <div class="ai-card">
      <h3><i class="ti ti-sparkles"></i> daily motivation</h3>
      <div class="ai-msg">${msg.text}</div>
      ${msg.chips.length?`<div class="ai-chips">${msg.chips.map(c=>`<span class="ai-chip">${c}</span>`).join('')}</div>`:''}
    </div>`;
}

function getDailyMotivation(adh,streak,done,total){
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  let text='',chips=[];

  if(streak>=7){text+=`🔥 ${streak}-day streak — you're on fire! Consistency is your superpower.\n\n`;}
  else if(streak>=3){text+=`⚡ ${streak} days in a row — momentum building! Keep the chain alive.\n\n`;}
  else{text+=`Every expert was once a beginner. Today is a fresh start.\n\n`;}

  if(adh===100){text+=`Perfect day so far — ${done}/${total} tasks done. Exceptional.\n`;}
  else if(adh>=80){text+=`Strong day — ${done}/${total} tasks done (${adh}%). Almost there!\n`;}
  else if(adh>=50){text+=`Halfway there — ${done}/${total} tasks done. The second half is where champions are made.\n`;}
  else if(done>0){text+=`${done} tasks done so far. Small steps still move you forward.\n`;}
  else{text+=`The hardest step is starting. Pick one task from your list right now.\n`;}

  // Goal nudges
  const learningItems=state.items.filter(i=>i.category==='learning'&&i.goal);
  if(learningItems.length){
    const today=todayStr();
    const learningDone=learningItems.filter(i=>isCompleted(i.id,today));
    if(learningDone.length<learningItems.length){
      text+=`\n📚 Your AI certification goal needs attention today — don't let it slip.`;
      chips.push('📚 learning pending');
    } else {
      text+=`\n🎓 Learning done today — great progress toward your AI certification!`;
      chips.push('🎓 learning ✓');
    }
  }
  const gymItem=state.items.find(i=>i.name==='Gym');
  if(gymItem){
    const today=todayStr();
    if(dayApplies(gymItem,today)&&!isCompleted(gymItem.id,today)){
      text+=`\n💪 Gym pending — every session moves you closer to that 20% body fat goal.`;
      chips.push('💪 gym pending');
    }
  }
  if(streak>0)chips.push(`🔥 ${streak} day streak`);
  chips.push(`📊 ${adh}% today`);
  return {text:text.trim(),chips};
}

async function runDeepAnalysis(forceRefresh){
  const el=document.getElementById('deep-analysis-result');
  const cacheKey='aiCoachCache_'+(window._currentUser?.uid||'guest');
  const noteEl=document.getElementById('ai-cache-note');

  // Check cache (valid for 24h) unless force refresh
  if(!forceRefresh){
    try{
      const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');
      if(cached&&Date.now()-cached.ts<86400000){
        el.innerHTML='<div style="font-size:13px;line-height:1.8;color:var(--txt)">'+cached.html+'</div>';
        const hours=Math.round((Date.now()-cached.ts)/3600000);
        if(noteEl)noteEl.textContent='Cached '+hours+'h ago — click "refresh" to update';
        return;
      }
    }catch(e){}
  }

  el.innerHTML='<div class="ai-loading"><div class="dot"></div><div class="dot"></div><div class="dot"></div><span style="font-size:13px;color:var(--txt2)">analysing your data…</span></div>';
  if(noteEl)noteEl.textContent='';

  const today=todayStr();
  const last30=Array.from({length:30},(_,i)=>addDays(today,-i));
  const adDays=last30.map(d=>getAdherence(d)).filter(a=>a!==null);
  const overallAdh=adDays.length?Math.round(adDays.reduce((s,a)=>s+a,0)/adDays.length):0;
  const weekAdh=Math.round(last30.slice(0,7).map(d=>getAdherence(d)).filter(a=>a!==null).reduce((s,a,_,arr)=>s+a/arr.length,0));
  const taskStats=state.items.map(it=>{let miss=0,tot=0;last30.forEach(d=>{if(dayApplies(it,d)){tot++;if(!isCompleted(it.id,d))miss++;}});return{name:it.name,cat:it.category,miss,tot,pct:tot?Math.round((tot-miss)/tot*100):0};});
  const dowStats={};SHORTDAY.forEach(d=>dowStats[d]={done:0,total:0});
  last30.forEach(d=>{const dow=SHORTDAY[parseDate(d).getDay()];state.items.filter(i=>dayApplies(i,d)).forEach(i=>{dowStats[dow].total++;if(isCompleted(i.id,d))dowStats[dow].done++;});});
  const weakDay=Object.entries(dowStats).filter(([,v])=>v.total>0).sort((a,b)=>(a[1].done/a[1].total)-(b[1].done/b[1].total))[0];
  const workDays=Object.keys(state.workLogs).filter(d=>state.workLogs[d].length>0).length;
  const totalWorkTasks=Object.values(state.workLogs).flatMap(v=>v).flatMap(e=>e.tasks).length;
  const worst=taskStats.filter(t=>t.tot>0).sort((a,b)=>a.pct-b.pct).slice(0,3);
  const best=taskStats.filter(t=>t.tot>0).sort((a,b)=>b.pct-a.pct).slice(0,3);

  const prompt='You are a personal productivity & health coach. Analyse this data and give specific, actionable coaching.\n\n'
    +'DATA (last 30 days):\n'
    +'- Overall adherence: '+overallAdh+'% | This week: '+weekAdh+'%\n'
    +'- Current streak: '+calcStreak()+' days\n'
    +'- Work: '+totalWorkTasks+' tasks logged across '+workDays+' days\n'
    +'- Weakest tasks: '+worst.map(t=>t.name+' ('+t.pct+'%)').join(', ')+'\n'
    +'- Best tasks: '+best.map(t=>t.name+' ('+t.pct+'%)').join(', ')+'\n'
    +'- Weakest day: '+(weakDay?weakDay[0]+' ('+Math.round(weakDay[1].done/weakDay[1].total*100)+'%)':'unknown')+'\n'
    +'- Routine categories: '+[...new Set(state.items.map(i=>i.category))].join(', ')+'\n\n'
    +'Goals: Reach 20% body fat, complete AI certification\n\n'
    +'Provide: 1) Pattern Analysis (2-3 specific patterns naming actual tasks), 2) Top 3 Actionable suggestions for this week, 3) Schedule Optimisation tip, 4) Goal trajectory assessment, 5) Single most important habit to nail this week.\n\nBe direct and data-driven. Max 300 words.';

  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
    const data=await resp.json();
    const txt=data.content?.find(b=>b.type==='text')?.text||'';
    if(!txt)throw new Error('empty');
    const formatted=txt.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
    el.innerHTML='<div style="font-size:13px;line-height:1.8;color:var(--txt)">'+formatted+'</div>';
    // Cache result
    try{localStorage.setItem(cacheKey,JSON.stringify({ts:Date.now(),html:formatted}));}catch(e){}
    if(noteEl)noteEl.textContent='Just refreshed — valid for 24h';
  }catch(e){
    const fallback=buildFallbackAnalysis(overallAdh,weekAdh,worst,best,weakDay);
    el.innerHTML='<div style="font-size:13px;color:var(--txt2);line-height:1.6">'+fallback+'</div>';
    if(noteEl)noteEl.textContent='Offline fallback — connect to internet for AI analysis';
  }
}
function formatAIText(txt){
  return txt
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/^#+\s*(.+)$/gm,'<strong>$1</strong>')
    .replace(/\n/g,'<br>');
}

function buildFallbackAnalysis(overallAdh,weekAdh,worst,best,weakDay,strongDay){
  let t='';
  t+=`<strong>📊 Pattern Analysis</strong><br>`;
  if(weakDay){const pct=Math.round(weakDay[1].done/weakDay[1].total*100);t+=`• Your weakest day is <strong>${weakDay[0].toUpperCase()}</strong> at ${pct}% adherence — plan something lighter or prep the night before.<br>`;}
  if(worst[0]){t+=`• <strong>${worst[0].name}</strong> is your most skipped task at ${worst[0].pct}% completion — it may need a better time slot.<br>`;}
  t+='<br>';
  t+=`<strong>🎯 Top Suggestions</strong><br>`;
  t+=`1. Stack your worst habit onto a best one — pair <em>${worst[0]?.name||'your weakest task'}</em> right after <em>${best[0]?.name||'your strongest task'}</em>.<br>`;
  t+=`2. On ${weakDay?weakDay[0].toUpperCase():'slow days'}, reduce your list to just the 3 most important tasks.<br>`;
  t+=`3. Log work entries mid-day, not just at the end — you'll capture more.<br><br>`;
  t+=`<strong>📚 Goal Nudge</strong><br>`;
  t+=`AI Cert: daily learning completion drives this. Make it non-negotiable — even 20 mins counts.<br>`;
  t+=`Body fat: Gym consistency is key. At current rate, stay the course; results take 8–12 weeks to show.<br><br>`;
  t+=`<strong>⭐ This Week's Focus</strong><br>`;
  t+=`Nail <strong>${worst[0]?.name||'your most skipped task'}</strong> every single day. One habit fixed changes the chain.`;
  return t;
}

function renderGoalProgress(){
  const goals=state.items.filter(i=>i.goal);
  if(!goals.length){document.getElementById('goal-progress').innerHTML='<p style="font-size:13px;color:var(--txt2)">add goal descriptions to your routine items to track them here.</p>';return;}
  const last30=Array.from({length:30},(_,i)=>addDays(todayStr(),-i));
  document.getElementById('goal-progress').innerHTML=goals.map(it=>{
    let tot=0,done=0;
    last30.forEach(d=>{if(dayApplies(it,d)){tot++;if(isCompleted(it.id,d))done++;}});
    const pct=tot?Math.round(done/tot*100):0;
    const col=pct>=80?'var(--teal)':pct>=50?'var(--amb)':'var(--red)';
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px">
        <span><strong>${esc(it.name)}</strong> <span style="font-size:11px;color:var(--txt2)">— ${esc(it.goal)}</span></span>
        <span style="font-weight:600;color:${col}">${pct}%</span>
      </div>
      <div class="pbg"><div class="pfill" style="width:${pct}%;background:${col}"></div></div>
      <div style="font-size:11px;color:var(--txt3);margin-top:3px">${done} of ${tot} scheduled days completed (last 30 days)</div>
    </div>`;
  }).join('');
}

function renderPatternInsights(){
  const today=todayStr();
  const last28=Array.from({length:28},(_,i)=>addDays(today,-i));
  const dowStats={};
  SHORTDAY.forEach(d=>dowStats[d]={done:0,total:0,label:d.charAt(0).toUpperCase()+d.slice(1)});
  last28.forEach(d=>{
    const dow=SHORTDAY[parseDate(d).getDay()];
    state.items.filter(i=>dayApplies(i,d)).forEach(i=>{
      dowStats[dow].total++;
      if(isCompleted(i.id,d))dowStats[dow].done++;
    });
  });
  const dowArr=SHORTDAY.map(d=>dowStats[d]);
  const insights=[];
  const sorted=[...dowArr].filter(d=>d.total>0).sort((a,b)=>(a.done/a.total)-(b.done/b.total));
  if(sorted.length>=2){
    const weak=sorted[0],strong=sorted[sorted.length-1];
    const weakPct=Math.round(weak.done/weak.total*100);
    const strongPct=Math.round(strong.done/strong.total*100);
    insights.push({icon:'📉',text:`<strong>${weak.label}s</strong> are your hardest day (${weakPct}% adherence). Consider a lighter schedule or prep the night before.`});
    insights.push({icon:'💪',text:`<strong>${strong.label}s</strong> are your strongest (${strongPct}%). Use that energy to tackle harder goals.`});
  }

  // Best hour analysis
  const hourDone={},hourTotal={};
  last28.forEach(d=>{state.items.filter(i=>dayApplies(i,d)&&i.time).forEach(i=>{const h=parseInt(i.time);if(!hourTotal[h])hourTotal[h]=0;if(!hourDone[h])hourDone[h]=0;hourTotal[h]++;if(isCompleted(i.id,d))hourDone[h]++;});});
  const bestHour=Object.keys(hourTotal).filter(h=>hourTotal[h]>=3).sort((a,b)=>(hourDone[b]/hourTotal[b])-(hourDone[a]/hourTotal[a]))[0];
  if(bestHour){const pct=Math.round(hourDone[bestHour]/hourTotal[bestHour]*100);insights.push({icon:'⏰',text:`Your <strong>${bestHour}:00</strong> slot has the highest completion rate (${pct}%). Schedule important tasks around this time.`});}

  // Streak insight
  const streak=calcStreak();
  if(streak>=3)insights.push({icon:'🔥',text:`You're on a <strong>${streak}-day streak</strong>. Research shows 21+ days builds a lasting habit.`});
  else if(streak===0)insights.push({icon:'🔄',text:`No current streak. Starting a 7-day challenge today will build momentum fast.`});

  // Category gap
  const catAdh={};
  [...new Set(state.items.map(i=>i.category))].forEach(c=>{
    let tot=0,done=0;
    last28.forEach(d=>state.items.filter(i=>i.category===c&&dayApplies(i,d)).forEach(i=>{tot++;if(isCompleted(i.id,d))done++;}));
    if(tot>0)catAdh[c]=Math.round(done/tot*100);
  });
  const weakCat=Object.entries(catAdh).sort((a,b)=>a[1]-b[1])[0];
  if(weakCat)insights.push({icon:'📂',text:`<strong>${weakCat[0].charAt(0).toUpperCase()+weakCat[0].slice(1)}</strong> tasks have the lowest adherence (${weakCat[1]}%). A small fix here can move your overall number significantly.`});

  document.getElementById('pattern-insights').innerHTML=insights.map(ins=>
    `<div style="display:flex;gap:10px;margin-bottom:12px;font-size:13px;line-height:1.6">
      <span style="font-size:18px;flex-shrink:0">${ins.icon}</span>
      <span>${ins.text}</span>
    </div>`).join('')||'<p style="font-size:13px;color:var(--txt2)">complete more tasks to unlock pattern insights.</p>';
}

// ═══════════════════════════════════════════════════════════════════
