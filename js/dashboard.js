// HOME DASHBOARD — gamified overview (XP, levels, badges, rings)
// ═══════════════════════════════════════════════════════════════════
const LEVEL_TITLES=['Newbie','Apprentice','Achiever','Consistent','Disciplined','Habit Master','Routine Pro','Elite','Champion','Legend'];
const BADGE_DEFS=[
  {id:'first_day',   icon:'🌱', name:'First Step',     test:s=>s.totalDaysActive>=1},
  {id:'streak_3',     icon:'🔥', name:'3-Day Streak',   test:s=>s.streak>=3},
  {id:'streak_7',     icon:'⚡', name:'Week Warrior',   test:s=>s.streak>=7},
  {id:'streak_30',    icon:'👑', name:'Habit Royalty',  test:s=>s.streak>=30},
  {id:'perfect_day',  icon:'💯', name:'Perfect Day',    test:s=>s.todayAdh===100},
  {id:'hydrated',     icon:'💧', name:'Hydrated',       test:s=>s.waterDone>=s.waterTarget},
  {id:'logged_meals', icon:'🍽', name:'Mindful Eater',  test:s=>s.mealCount>=3},
  {id:'level_5',      icon:'🏆', name:'Level 5',        test:s=>s.level>=5},
];
function xpStorageKey(){return 'rtXP_'+(window._currentUser?.uid||'guest');}
function getXPState(){
  try{const s=localStorage.getItem(xpStorageKey());return s?JSON.parse(s):{xp:0,lastLevel:1,unlockedBadges:[],daysActive:[]};}
  catch(e){return{xp:0,lastLevel:1,unlockedBadges:[],daysActive:[]};}
}
function saveXPState(x){try{localStorage.setItem(xpStorageKey(),JSON.stringify(x));}catch(e){}}
function xpForLevel(level){return Math.round(100*Math.pow(level,1.4));} // increasing XP curve
function levelFromXP(xp){
  let lvl=1,acc=0;
  while(acc+xpForLevel(lvl)<=xp){acc+=xpForLevel(lvl);lvl++;}
  return {level:lvl, xpIntoLevel:xp-acc, xpForThisLevel:xpForLevel(lvl)};
}
function awardXP(amount,reason){
  const x=getXPState();
  const before=levelFromXP(x.xp).level;
  x.xp=Math.max(0,x.xp+amount);
  const after=levelFromXP(x.xp).level;
  const today=todayStr();
  if(!x.daysActive.includes(today))x.daysActive.push(today);
  saveXPState(x);
  if(after>before){
    showLevelUpToast(after);
    fireConfetti();
  }
  return x;
}
function showLevelUpToast(level){
  const t=document.createElement('div');
  t.className='level-up-toast';
  const title=LEVEL_TITLES[Math.min(level-1,LEVEL_TITLES.length-1)];
  t.innerHTML='🎉 LEVEL UP!<div class="lu-sub">You reached Level '+level+' — '+title+'</div>';
  document.body.appendChild(t);
  setTimeout(()=>{t.style.transition='opacity .4s';t.style.opacity='0';setTimeout(()=>t.remove(),400);},2200);
}
function fireConfetti(){
  const colors=['#1D9E75','#BA7517','#534AB7','#D85A30','#185FA5','#FFD700'];
  for(let i=0;i<28;i++){
    const p=document.createElement('div');
    p.className='confetti-piece';
    p.style.left=Math.random()*100+'vw';
    p.style.background=colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDelay=(Math.random()*0.3)+'s';
    p.style.borderRadius=Math.random()>0.5?'50%':'2px';
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),1800);
  }
}
function unlockNewBadges(metrics){
  const x=getXPState();
  let newlyUnlocked=[];
  BADGE_DEFS.forEach(b=>{
    if(!x.unlockedBadges.includes(b.id)&&b.test(metrics)){
      x.unlockedBadges.push(b.id);
      newlyUnlocked.push(b);
    }
  });
  if(newlyUnlocked.length){saveXPState(x);}
  return newlyUnlocked;
}

function computeDashboardMetrics(){
  const today=todayStr();
  const s=getSettings();
  const allItems=state.items.filter(i=>dayApplies(i,today));
  const doneItems=allItems.filter(i=>isCompleted(i.id,today));
  const todayAdh=allItems.length?Math.round(doneItems.length/allItems.length*100):0;

  // Exercise minutes: completed fitness routine items plus detailed exercise logs.
  const exerciseItems=doneItems.filter(i=>(i.category==='health'||i.category==='fitness')&&i.duration);
  const routineExerciseMin=exerciseItems.reduce((s2,i)=>s2+(parseInt(i.duration)||0),0);
  const exerciseEntries=(state.exerciseLogs[today]||[]);
  const loggedExerciseMin=exerciseEntries.reduce((s2,e)=>s2+(parseInt(e.duration)||0),0);
  const exerciseMin=routineExerciseMin+loggedExerciseMin;
  const exerciseCal=exerciseEntries.reduce((s2,e)=>s2+(e.calories||0),0);
  const exerciseTarget=60; // sensible default daily movement target

  // Nutrition
  const mealEntries=(state.mealLogs[today]||[]);
  const calTotal=mealEntries.reduce((s2,e)=>s2+(e.cal||0),0);
  const calTarget=s.calTarget||2000;

  // Water
  const waterDone=getWaterToday();
  const waterTarget=s.waterTarget||8;

  const xpState=getXPState();
  const {level,xpIntoLevel,xpForThisLevel}=levelFromXP(xpState.xp);
  const streak=calcStreak();

  return{
    today,todayAdh,doneCount:doneItems.length,totalCount:allItems.length,
    exerciseMin,exerciseTarget,exerciseCal,
    calTotal,calTarget,
    waterDone,waterTarget,
    mealCount:mealEntries.length,
    level,xpIntoLevel,xpForThisLevel,xp:xpState.xp,
    streak,
    totalDaysActive:xpState.daysActive.length,
  };
}

function ringSVG(pct,color){
  const r=28,c=2*Math.PI*r,offset=c-(Math.min(pct,100)/100)*c;
  return '<svg width="64" height="64" viewBox="0 0 64 64">'
    +'<circle class="ring-bg" cx="32" cy="32" r="'+r+'"></circle>'
    +'<circle class="ring-fg" cx="32" cy="32" r="'+r+'" stroke="'+color+'" stroke-dasharray="'+c+'" stroke-dashoffset="'+offset+'"></circle>'
    +'</svg>';
}

let _lastDashAward=null; // prevent double-awarding XP for same state in one session
function renderHome(){
  const m=computeDashboardMetrics();

  // ── Hero card: level, XP bar, streak ──
  const title=LEVEL_TITLES[Math.min(m.level-1,LEVEL_TITLES.length-1)];
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  const xpPct=m.xpForThisLevel?Math.round(m.xpIntoLevel/m.xpForThisLevel*100):0;
  const streakHtml=m.streak>0
    ?'<span class="streak-flame">🔥</span><span class="streak-text">'+m.streak+'-day streak</span><span class="streak-sub">keep it going!</span>'
    :'<span class="streak-flame">💤</span><span class="streak-text">no streak yet</span><span class="streak-sub">complete today to start one</span>';
  document.getElementById('hero-card').innerHTML=
    '<div class="hero-top">'
    +'<div><div class="hero-greeting">'+greeting+', '+(window._currentUser?.name?esc(window._currentUser.name):'there')+'</div></div>'
    +'<div class="hero-level"><div class="level-badge">'+m.level+'</div><div class="level-info"><div class="lv-num">LEVEL '+m.level+'</div><div class="lv-title">'+title+'</div></div></div>'
    +'</div>'
    +'<div class="xp-bar-wrap"><div class="xp-bar-label"><span>'+m.xpIntoLevel+' / '+m.xpForThisLevel+' XP</span><span>'+xpPct+'%</span></div>'
    +'<div class="xp-bar-bg"><div class="xp-bar-fill" style="width:'+xpPct+'%"></div></div></div>'
    +'<div class="streak-row">'+streakHtml+'</div>';

  // ── Progress rings ──
  const rings=[
    {key:'adherence',label:'adherence',icon:'✅',pct:m.todayAdh,color:'#1D9E75',sub:m.doneCount+'/'+m.totalCount+' tasks'},
    {key:'calories',label:'calories',icon:'🍽',pct:m.calTarget?Math.round(m.calTotal/m.calTarget*100):0,color:'#BA7517',sub:Math.round(m.calTotal)+'/'+m.calTarget+' kcal'},
    {key:'water',label:'water',icon:'💧',pct:m.waterTarget?Math.round(m.waterDone/m.waterTarget*100):0,color:'#185FA5',sub:m.waterDone+'/'+m.waterTarget+' glasses'},
    {key:'exercise',label:'exercise',icon:'💪',pct:m.exerciseTarget?Math.round(m.exerciseMin/m.exerciseTarget*100):0,color:'#D85A30',sub:m.exerciseMin+'/'+m.exerciseTarget+' min · '+Math.round(m.exerciseCal||0)+' kcal'},
  ];
  document.getElementById('ring-grid').innerHTML=rings.map(r=>{
    const navTarget=r.key==='calories'||r.key==='water'?'meals':r.key==='exercise'?'exercise':'today';
    return '<div class="ring-card" onclick="showView(&quot;'+navTarget+'&quot;)" title="'+r.sub+'">'
      +'<div class="ring-wrap">'+ringSVG(r.pct,r.color)+'<div class="ring-icon">'+r.icon+'</div></div>'
      +'<div class="ring-label">'+r.label+'</div>'
      +'<div class="ring-value" style="color:'+r.color+'">'+Math.min(r.pct,100)+'%</div>'
      +'</div>';
  }).join('');

  // ── Badges ──
  const xpState=getXPState();
  document.getElementById('badge-strip').innerHTML=BADGE_DEFS.map(b=>{
    const unlocked=xpState.unlockedBadges.includes(b.id);
    return '<div class="badge-pill '+(unlocked?'':'locked')+'" title="'+esc(b.name)+(unlocked?' — unlocked!':' — locked')+'">'
      +'<span class="badge-icon">'+(unlocked?b.icon:'🔒')+'</span>'+esc(b.name)+'</div>';
  }).join('');

  // ── Daily quest (simple rotating challenge) ──
  renderDailyQuest(m);

  // ── Next 2-3 todos ──
  renderTodoMini(m);

  // ── XP awarding: based on today's progress, idempotent per render via comparison ──
  processXPForToday(m);

  // ── Badge unlock celebration ──
  const newBadges=unlockNewBadges(m);
  if(newBadges.length){
    setTimeout(()=>{
      newBadges.forEach((b,i)=>{
        setTimeout(()=>showToast(b.icon+' Badge unlocked: '+b.name+'!',3000),i*400);
      });
      fireConfetti();
    },300);
  }
}

function renderDailyQuest(m){
  const el=document.getElementById('quest-card');
  const remaining=m.totalCount-m.doneCount;
  let quest=null;
  if(m.todayAdh===100&&m.totalCount>0){
    quest={icon:'ti-trophy',title:'Quest complete!',desc:'You finished every task today. Outstanding discipline.',reward:'+50 XP awarded'};
  }else if(remaining>0&&remaining<=2){
    quest={icon:'ti-target-arrow',title:'Almost there!',desc:'Just '+remaining+' task'+(remaining>1?'s':'')+' left to complete a perfect day.',reward:'Finish for +50 XP bonus'};
  }else if(m.waterDone<m.waterTarget){
    quest={icon:'ti-droplet',title:'Stay hydrated',desc:'Drink '+(m.waterTarget-m.waterDone)+' more glass'+(m.waterTarget-m.waterDone>1?'es':'')+' of water today.',reward:'+5 XP per glass'};
  }else if(m.exerciseMin<30){
    quest={icon:'ti-run',title:'Get moving',desc:'Log at least 30 minutes of exercise today.',reward:'+20 XP'};
  }
  if(quest){
    el.style.display='block';
    el.innerHTML='<div class="quest-hdr"><i class="ti '+quest.icon+'"></i><span class="quest-title">'+quest.title+'</span></div>'
      +'<div class="quest-desc">'+quest.desc+'</div>'
      +'<div class="quest-reward">🎁 '+quest.reward+'</div>';
  }else{el.style.display='none';}
}

function renderTodoMini(m){
  const today=todayStr();
  const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  const pending=state.items.filter(i=>dayApplies(i,today)&&!isCompleted(i.id,today))
    .sort((a,b)=>(a.time||'').localeCompare(b.time||''))
    .slice(0,3);
  document.getElementById('todo-mini-count').textContent=pending.length+' pending';
  const el=document.getElementById('todo-mini-list');
  if(!pending.length){
    el.innerHTML='<div class="todo-mini-empty">🎉 Nothing pending — you are all caught up!</div>';
    return;
  }
  el.innerHTML=pending.map(it=>{
    const[h,mn]=(it.time||'00:00').split(':').map(Number);
    const overdue=h*60+mn<nowMin;
    return '<div class="todo-mini-item">'
      +'<div class="todo-mini-check" onclick="toggleCompleteFromHome(&quot;'+it.id+'&quot;)"></div>'
      +'<span class="todo-mini-name">'+esc(it.name)+'</span>'
      +'<span class="todo-mini-time" style="'+(overdue?'color:var(--red)':'')+'">'+(it.time||'')+'</span>'
      +'</div>';
  }).join('');
}
function toggleCompleteFromHome(id){
  const today=todayStr();
  toggleComplete(id,today);
  awardXP(10,'task_complete');
  renderHome();
}

// Award XP once per unique progress milestone per day (stored to avoid double-awarding on every render)
function processXPForToday(m){
  const key='xpAwarded_'+m.today+'_'+(window._currentUser?.uid||'guest');
  let awarded;
  try{awarded=JSON.parse(localStorage.getItem(key)||'{}');}catch(e){awarded={};}
  let changed=false;

  // Perfect day bonus
  if(m.todayAdh===100&&m.totalCount>0&&!awarded.perfectDay){
    awardXP(50,'perfect_day');awarded.perfectDay=true;changed=true;
  }
  // Water target reached
  if(m.waterDone>=m.waterTarget&&m.waterTarget>0&&!awarded.waterGoal){
    awardXP(15,'water_goal');awarded.waterGoal=true;changed=true;
  }
  // Exercise milestone
  if(m.exerciseMin>=30&&!awarded.exercise30){
    awardXP(20,'exercise_30');awarded.exercise30=true;changed=true;
  }
  // Meal logging milestone
  if(m.mealCount>=3&&!awarded.mealsLogged){
    awardXP(10,'meals_logged');awarded.mealsLogged=true;changed=true;
  }
  if(changed){try{localStorage.setItem(key,JSON.stringify(awarded));}catch(e){}}
}
