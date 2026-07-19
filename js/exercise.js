// EXERCISE LOGGER — common activities with estimated calorie burn.
// Calories are estimates based on MET-style intensity, body weight, and duration.
const EXERCISE_DB = [
  {name:'Walking', category:'cardio', met:3.3, defaultDuration:30},
  {name:'Brisk Walking', category:'cardio', met:4.3, defaultDuration:30},
  {name:'Running 6 km/h', category:'cardio', met:6.0, defaultDuration:25},
  {name:'Running 8 km/h', category:'cardio', met:8.3, defaultDuration:25},
  {name:'Running 10 km/h', category:'cardio', met:9.8, defaultDuration:20},
  {name:'Cycling moderate', category:'cardio', met:6.8, defaultDuration:30},
  {name:'Elliptical', category:'cardio', met:5.0, defaultDuration:30},
  {name:'Rowing machine', category:'cardio', met:7.0, defaultDuration:20},
  {name:'Swimming laps', category:'cardio', met:7.0, defaultDuration:30},
  {name:'Badminton', category:'sport', met:5.5, defaultDuration:45},
  {name:'Football / Soccer', category:'sport', met:7.0, defaultDuration:45},
  {name:'Basketball', category:'sport', met:6.5, defaultDuration:40},
  {name:'Yoga', category:'mobility', met:2.5, defaultDuration:30},
  {name:'Power Yoga', category:'mobility', met:4.0, defaultDuration:30},
  {name:'HIIT', category:'conditioning', met:8.0, defaultDuration:20},
  {name:'Strength Training', category:'strength', met:5.0, defaultDuration:45},
  {name:'Squat', category:'strength', met:5.5, defaultDuration:20},
  {name:'Deadlift', category:'strength', met:6.0, defaultDuration:20},
  {name:'Bench Press', category:'strength', met:4.5, defaultDuration:20},
  {name:'Shoulder Press', category:'strength', met:4.5, defaultDuration:20},
  {name:'Lunges', category:'strength', met:5.0, defaultDuration:15},
  {name:'Push-ups', category:'strength', met:4.0, defaultDuration:12},
  {name:'Pull-ups', category:'strength', met:5.0, defaultDuration:12},
  {name:'Plank', category:'core', met:3.5, defaultDuration:5},
  {name:'Crunches', category:'core', met:3.8, defaultDuration:10},
  {name:'Skipping Rope', category:'conditioning', met:11.8, defaultDuration:15},
];

function getExerciseBodyWeightKg(){
  const input=parseFloat(document.getElementById('exercise-bodyweight')?.value);
  if(input>0)return input;
  const s=getSettings();
  const latest=[...(state.bodyMetrics||[])].sort((a,b)=>a.date.localeCompare(b.date)).pop();
  let weight=latest?.weight||s.currentWeight||75;
  if((s.weightUnit||'kg')==='lb') weight=weight*0.453592;
  return Math.max(30, weight||75);
}
function setExerciseBodyWeightDefault(){
  const el=document.getElementById('exercise-bodyweight');
  if(el&&!el.value)el.value=Math.round(getExerciseBodyWeightKg());
}
function calcExerciseCalories(ex, duration, intensity, bodyWeightKg, sets, reps, loadKg){
  const minutes=Math.max(1, duration||ex.defaultDuration||30);
  const met=(ex.met||4)*Math.max(0.5,intensity||1);
  let calories=met*3.5*bodyWeightKg/200*minutes;
  if((ex.category==='strength'||ex.category==='core')&&sets&&reps){
    const volume=Math.max(0,sets*reps*Math.max(loadKg||0, bodyWeightKg*0.15));
    calories+=Math.min(90, volume/140);
  }
  return Math.max(1, Math.round(calories));
}
function currentExerciseEstimate(){
  const ex=selectedExercise||{name:'Custom exercise',category:'custom',met:4,defaultDuration:30};
  const duration=parseFloat(document.getElementById('exercise-duration')?.value)||ex.defaultDuration||30;
  const sets=parseFloat(document.getElementById('exercise-sets')?.value)||0;
  const reps=parseFloat(document.getElementById('exercise-reps')?.value)||0;
  const loadKg=parseFloat(document.getElementById('exercise-load')?.value)||0;
  const intensity=parseFloat(document.getElementById('exercise-intensity')?.value)||1;
  const bodyWeightKg=getExerciseBodyWeightKg();
  const volume=sets&&reps?Math.round(sets*reps*loadKg):0;
  const calories=calcExerciseCalories(ex,duration,intensity,bodyWeightKg,sets,reps,loadKg);
  return {ex,duration,sets,reps,loadKg,intensity,bodyWeightKg,volume,calories};
}
function searchExercise(query){
  const box=document.getElementById('exercise-suggestions');
  if(!box)return;
  if(!query||query.length<2){box.style.display='none';return;}
  const q=query.toLowerCase();
  const filtered=EXERCISE_DB.filter(e=>e.name.toLowerCase().includes(q)||e.category.includes(q)).slice(0,12);
  if(!filtered.length){box.style.display='none';return;}
  window._exerciseResults=filtered;
  box.style.display='block';
  box.innerHTML=filtered.map((e,i)=>`<div class="food-sug-item exercise-sug-item" onclick="selectExerciseByIndex(${i})">
    <div class="food-sug-main"><span>${esc(e.name)}</span><span class="food-sug-unit">${e.category}</span></div>
    <div class="food-sug-macros"><span class="cal">MET ${e.met}</span><span>${e.defaultDuration} min default</span></div>
  </div>`).join('');
}
function selectExerciseByIndex(i){selectExercise(window._exerciseResults[i]);}
function selectExercise(ex){
  selectedExercise=ex;
  document.getElementById('exercise-search').value=ex.name;
  document.getElementById('exercise-duration').value=ex.defaultDuration||30;
  document.getElementById('exercise-suggestions').style.display='none';
  document.getElementById('selected-exercise-name').textContent=`${ex.name} — ${ex.category}, MET ${ex.met}. Calories are estimates.`;
  setExerciseBodyWeightDefault();
  updateExercisePreview();
}
function addCustomExercise(){
  const name=document.getElementById('exercise-search').value.trim();
  if(!name){alert('type an exercise name first');return;}
  selectedExercise={name,category:'custom',met:4,defaultDuration:parseFloat(document.getElementById('exercise-duration').value)||30,custom:true};
  document.getElementById('selected-exercise-name').textContent=name+' — custom exercise, moderate estimate';
  document.getElementById('exercise-suggestions').style.display='none';
  setExerciseBodyWeightDefault();
  updateExercisePreview();
}
function updateExercisePreview(){
  if(!selectedExercise){
    ['exercise-prev-cal','exercise-prev-volume','exercise-prev-type','exercise-prev-met'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='—';});
    return;
  }
  const e=currentExerciseEstimate();
  document.getElementById('exercise-prev-cal').textContent=e.calories+'kcal';
  document.getElementById('exercise-prev-volume').textContent=e.volume?e.volume+'kg':'—';
  document.getElementById('exercise-prev-type').textContent=e.ex.category;
  document.getElementById('exercise-prev-met').textContent=(e.ex.met*e.intensity).toFixed(1);
}
function clearExerciseSelection(){
  selectedExercise=null;
  document.getElementById('exercise-search').value='';
  document.getElementById('exercise-duration').value='30';
  document.getElementById('exercise-sets').value='3';
  document.getElementById('exercise-reps').value='10';
  document.getElementById('exercise-load').value='0';
  document.getElementById('exercise-intensity').value='1';
  document.getElementById('exercise-suggestions').style.display='none';
  document.getElementById('selected-exercise-name').textContent='';
  updateExercisePreview();
}
function logExerciseEntry(){
  if(!selectedExercise){alert('please select or add an exercise first');return;}
  const d=state.exerciseDate||todayStr();
  const e=currentExerciseEstimate();
  if(!state.exerciseLogs)state.exerciseLogs={};
  if(!state.exerciseLogs[d])state.exerciseLogs[d]=[];
  state.exerciseLogs[d].push({
    id:Date.now().toString(), name:e.ex.name, category:e.ex.category,
    duration:e.duration, sets:e.sets, reps:e.reps, loadKg:e.loadKg,
    bodyWeightKg:Math.round(e.bodyWeightKg*10)/10, intensity:e.intensity,
    met:Math.round((e.ex.met*e.intensity)*10)/10, volume:e.volume,
    calories:e.calories, time:new Date().toTimeString().slice(0,5)
  });
  save();
  const name=e.ex.name;
  clearExerciseSelection();
  renderExercise();
  showToast(name+' logged ✓');
}
function deleteExerciseEntry(d,id){
  if(!confirm('remove this exercise entry?'))return;
  state.exerciseLogs[d]=(state.exerciseLogs[d]||[]).filter(e=>e.id!==id);
  save();renderExercise();
}
function renderExercise(){
  const d=state.exerciseDate||todayStr();
  document.getElementById('exercise-date-label').textContent=fmtDate(d)+(d===todayStr()?' — today':'');
  setExerciseBodyWeightDefault();
  const entries=(state.exerciseLogs&&state.exerciseLogs[d])||[];
  const totals=entries.reduce((a,e)=>({duration:a.duration+(parseFloat(e.duration)||0),calories:a.calories+(e.calories||0),volume:a.volume+(e.volume||0),sessions:a.sessions+1}),{duration:0,calories:0,volume:0,sessions:0});
  document.getElementById('exercise-metrics').innerHTML=`
    <div class="mc"><div class="ml">sessions</div><div class="mv">${totals.sessions}</div></div>
    <div class="mc"><div class="ml">minutes</div><div class="mv green">${Math.round(totals.duration)}</div></div>
    <div class="mc"><div class="ml">calories</div><div class="mv amber">${Math.round(totals.calories)}</div></div>
    <div class="mc"><div class="ml">volume</div><div class="mv">${totals.volume?Math.round(totals.volume/100)/10+'k':'—'}</div></div>`;
  const el=document.getElementById('exercise-entries');
  document.getElementById('empty-exercise').style.display=entries.length?'none':'block';
  if(!entries.length){el.innerHTML='';return;}
  el.innerHTML=entries.map(e=>`<div class="exercise-entry">
    <div class="exercise-entry-main">
      <button onclick="deleteExerciseEntry('${d}','${e.id}')" class="exercise-delete" title="remove"><i class="ti ti-x"></i></button>
      <div class="ibody"><div class="iname">${esc(e.name)}</div>
        <div class="imeta"><span>${e.duration} min</span><span class="icat cat-fitness">${e.category}</span>${e.sets&&e.reps?`<span>${e.sets} x ${e.reps}${e.loadKg?' @ '+e.loadKg+'kg':''}</span>`:''}<span>MET ${e.met}</span></div>
      </div>
      <div class="exercise-cal">${e.calories} kcal</div>
    </div>
  </div>`).join('');
}
