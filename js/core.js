// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const SHORTDAY=['sun','mon','tue','wed','thu','fri','sat'];
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULLDAY=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const CAT_COLORS={health:'#1D9E75',fitness:'#D85A30',work:'#185FA5',personal:'#534AB7',meal:'#BA7517',learning:'#3B6D11'};
const VIEWS=['home','today','meals','exercise','work','summary','coach','reports','schedule','import'];

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════
let state={
  items:[], completions:{}, workLogs:{}, mealLogs:{}, exerciseLogs:{}, bodyMetrics:[], waterLog:{},
  currentDate:todayStr(), workDate:todayStr(), summaryDate:todayStr(), mealDate:todayStr(), exerciseDate:todayStr(),
  reportPeriod:'week', pendingImport:[], filterCat:'all',
  taskChips:[], activeMealType:'breakfast', editingWorkEntry: null
};
let currentView='home';
let selectedFood=null; // {name, cal, protein, carbs, fat, unit, perUnit}
let selectedExercise=null; // {name, met, category}

// ═══════════════════════════════════════════════════════════════════
// DATE HELPERS
// ═══════════════════════════════════════════════════════════════════
function todayStr(){const d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());}
function p2(n){return n<10?'0'+n:''+n;}
function parseDate(s){const[y,m,d]=s.split('-');return new Date(+y,+m-1,+d);}
function addDays(s,n){const d=parseDate(s);d.setDate(d.getDate()+n);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());}
function fmtDate(s){const d=parseDate(s);return FULLDAY[d.getDay()]+', '+d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear();}
function fmtShort(s){const d=parseDate(s);return d.getDate()+' '+MONTHS[d.getMonth()];}

function dayApplies(item,dateStr){
  const d=parseDate(dateStr),dow=d.getDay();
  const raw=(item.days||'everyday').toString().toLowerCase().trim();
  if(raw==='everyday'||raw==='daily') return true;
  if(raw==='weekday'||raw==='weekdays') return dow>=1&&dow<=5;
  if(raw==='weekend'||raw==='weekends') return dow===0||dow===6;
  return raw.split(',').map(x=>x.trim()).includes(SHORTDAY[dow]);
}

// ═══════════════════════════════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════════════════════════════
let saveTimer=null;
function save(){
  const _uid=window._currentUser?.uid||'guest';
  try{localStorage.setItem('rtV3_'+_uid,JSON.stringify({items:state.items,completions:state.completions,workLogs:state.workLogs,mealLogs:state.mealLogs,exerciseLogs:state.exerciseLogs,bodyMetrics:state.bodyMetrics,waterLog:state.waterLog}));}catch(e){}
  setSyncDot('saving');
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{if(typeof window._saveToFirebase==='function')await window._saveToFirebase();setSyncDot(window.FIREBASE_READY?'live':'off');},800);
}
function loadLocal(){
  const _uid=window._currentUser?.uid||'guest';
  try{const s=localStorage.getItem('rtV3_'+_uid);if(s){const p=JSON.parse(s);state.items=p.items||[];state.completions=p.completions||{};state.workLogs=p.workLogs||{};state.mealLogs=p.mealLogs||{};state.exerciseLogs=p.exerciseLogs||{};state.bodyMetrics=p.bodyMetrics||[];state.waterLog=p.waterLog||{};}}catch(e){}
}
function setSyncDot(st){
  const d=document.getElementById('sync-dot');if(!d)return;
  d.className='sync-dot';
  if(st==='live'){d.classList.add('live');d.title='synced ✓';}
  else if(st==='saving'){d.classList.add('saving');d.title='saving…';}
  else if(st==='error'){d.classList.add('error');d.title='sync error';}
  else{d.title='offline mode';}
}

// ═══════════════════════════════════════════════════════════════════
// COMPLETION
// ═══════════════════════════════════════════════════════════════════
function ck(id,d){return id+'__'+d;}
function isCompleted(id,d){return !!state.completions[ck(id,d)];}
function toggleComplete(id,d){
  const k=ck(id,d);
  if(state.completions[k])delete state.completions[k];else state.completions[k]=true;
  save();renderToday();
}
function wasSkippedYesterday(id,d){
  const y=addDays(d,-1),it=state.items.find(i=>i.id===id);
  if(!it||!dayApplies(it,y))return false;
  return !isCompleted(id,y);
}
function getAdherence(d){
  const items=state.items.filter(i=>dayApplies(i,d));
  if(!items.length)return null;
  return Math.round(items.filter(i=>isCompleted(i.id,d)).length/items.length*100);
}
function calcStreak(){
  let n=0,d=todayStr();
  for(let i=0;i<365;i++){const a=getAdherence(d);if(a===null||a<50)break;n++;d=addDays(d,-1);}
  return n;
}

// ═══════════════════════════════════════════════════════════════════
// VIEW ROUTING
// ═══════════════════════════════════════════════════════════════════
function showView(v){
  currentView=v;
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById('view-'+v); if(el) el.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach((el,i)=>el.classList.toggle('active',VIEWS[i]===v));
  VIEWS.forEach(n=>{const b=document.getElementById('bn-'+n);if(b)b.classList.toggle('active',n===v);});
  if(v==='home')      renderHome();
  if(v==='today')     renderToday();
  if(v==='meals')     renderMeals();
  if(v==='exercise')  renderExercise();
  if(v==='work')      renderWork();
  if(v==='summary')   renderSummary();
  if(v==='coach')     renderCoach();
  if(v==='reports')   renderReports();
  if(v==='schedule')  renderSchedule();
}
function renderCurrent(){showView(currentView);}

function changeDay(n){state.currentDate=addDays(state.currentDate,n);save();renderToday();}
function goToday(){state.currentDate=todayStr();renderToday();}
function changeWorkDay(n){state.workDate=addDays(state.workDate,n);renderWork();}
function goWorkToday(){state.workDate=todayStr();renderWork();}
function changeSummaryDay(n){state.summaryDate=addDays(state.summaryDate,n);renderSummary();}
function goSummaryToday(){state.summaryDate=todayStr();renderSummary();}
function changeExerciseDay(n){state.exerciseDate=addDays(state.exerciseDate,n);renderExercise();}
function goExerciseToday(){state.exerciseDate=todayStr();renderExercise();}

// ═══════════════════════════════════════════════════════════════════
// TODAY
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
