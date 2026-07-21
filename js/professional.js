// PRODUCT UI + RETENTION LAYER
// Keeps feature logic intact while giving RoutineOS a more cohesive health-app experience.

const REWARD_DEFS = [
  { id: 'first_log', icon: 'ti-flag', name: 'First Log', desc: 'Log anything once', test: m => m.mealCount + m.exerciseCount + m.doneCount > 0 },
  { id: 'three_meals', icon: 'ti-tools-kitchen-2', name: 'Food Rhythm', desc: 'Log 3 meals in a day', test: m => m.mealCount >= 3 },
  { id: 'move_30', icon: 'ti-run', name: 'Moved Today', desc: 'Reach 30 active minutes', test: m => m.exerciseMin >= 30 },
  { id: 'protein_goal', icon: 'ti-meat', name: 'Protein Hit', desc: 'Reach protein target', test: m => m.protein >= m.proteinTarget && m.proteinTarget > 0 },
  { id: 'perfect_day', icon: 'ti-award', name: 'Perfect Day', desc: 'Complete all routines', test: m => m.todayAdh === 100 && m.totalCount > 0 },
  { id: 'streak_3', icon: 'ti-flame', name: '3-Day Streak', desc: 'Stay consistent 3 days', test: m => m.streak >= 3 },
  { id: 'streak_7', icon: 'ti-calendar-stats', name: 'Week Locked', desc: 'Stay consistent 7 days', test: m => m.streak >= 7 },
  { id: 'level_5', icon: 'ti-shield-star', name: 'Level 5', desc: 'Earn enough XP for level 5', test: m => m.level >= 5 }
];

function clampValue(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pctValue(val, target) {
  return target ? clampValue(Math.round(val / target * 100), 0, 100) : 0;
}

function getNutritionTotalsForDate(d) {
  const entries = state.mealLogs[d] || [];
  return entries.reduce((a, e) => ({
    cal: a.cal + (e.cal || 0),
    protein: a.protein + (e.protein || 0),
    carbs: a.carbs + (e.carbs || 0),
    fat: a.fat + (e.fat || 0),
    count: a.count + 1
  }), { cal: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
}

function getExerciseTotalsForDate(d) {
  const entries = (state.exerciseLogs && state.exerciseLogs[d]) || [];
  return entries.reduce((a, e) => ({
    minutes: a.minutes + (parseFloat(e.duration) || 0),
    calories: a.calories + (e.calories || 0),
    volume: a.volume + (e.volume || 0),
    count: a.count + 1
  }), { minutes: 0, calories: 0, volume: 0, count: 0 });
}

function getRoutineTotalsForDate(d) {
  const all = state.items.filter(i => dayApplies(i, d));
  const done = all.filter(i => isCompleted(i.id, d));
  return { all, done, pct: all.length ? Math.round(done.length / all.length * 100) : 0 };
}

function getHomeMetrics() {
  const today = todayStr();
  const settings = getSettings();
  const routine = getRoutineTotalsForDate(today);
  const nutrition = getNutritionTotalsForDate(today);
  const exercise = getExerciseTotalsForDate(today);
  const xpState = getXPState();
  const level = levelFromXP(xpState.xp);
  const water = getWaterToday();
  const proteinTarget = settings.proteinTarget || 120;
  const calTarget = settings.calTarget || 2000;
  const waterTarget = settings.waterTarget || 8;
  const exerciseTarget = settings.trainingStyle === 'cardio' ? 60 : 45;
  const calorieRemaining = Math.round(calTarget - nutrition.cal + exercise.calories);
  const readiness = Math.round(
    routine.pct * 0.34 +
    pctValue(nutrition.protein, proteinTarget) * 0.22 +
    pctValue(exercise.minutes, exerciseTarget) * 0.22 +
    pctValue(water, waterTarget) * 0.12 +
    pctValue(nutrition.count, 3) * 0.10
  );

  return {
    today, settings, routine, nutrition, exercise, water,
    proteinTarget, calTarget, waterTarget, exerciseTarget,
    calorieRemaining, readiness,
    todayAdh: routine.pct,
    doneCount: routine.done.length,
    totalCount: routine.all.length,
    mealCount: nutrition.count,
    exerciseCount: exercise.count,
    exerciseMin: exercise.minutes,
    protein: nutrition.protein,
    streak: calcStreak(),
    xp: xpState.xp,
    level: level.level,
    xpIntoLevel: level.xpIntoLevel,
    xpForThisLevel: level.xpForThisLevel,
    unlockedRewards: getUnlockedRewards()
  };
}

function progressLine(label, value, target, color, suffix) {
  const pct = pctValue(value, target);
  return '<div class="metric-line"><div class="metric-line-head"><span>' + label + '</span><strong>' +
    Math.round(value) + suffix + ' / ' + Math.round(target) + suffix + '</strong></div>' +
    '<div class="metric-track"><div style="width:' + pct + '%;background:' + color + '"></div></div></div>';
}

function weekTrendHtml() {
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayStr(), i - 6));
  return '<div class="week-trend">' + days.map(d => {
    const routine = getRoutineTotalsForDate(d);
    const label = fmtShort(d).split(' ')[0];
    return '<div class="trend-day" title="' + fmtDate(d) + ': ' + routine.pct + '%">' +
      '<div class="trend-bar"><span style="height:' + Math.max(6, routine.pct) + '%"></span></div><small>' + label + '</small></div>';
  }).join('') + '</div>';
}

function miniMetricRing(pct, color, label) {
  const safePct = pctValue(pct, 100);
  const r = 23;
  const c = 2 * Math.PI * r;
  const offset = c - safePct / 100 * c;
  return '<div class="mini-metric-ring" title="' + safePct + '% ' + esc(label || 'complete') + '">' +
    '<svg viewBox="0 0 56 56"><circle class="mini-ring-bg" cx="28" cy="28" r="' + r + '"></circle>' +
    '<circle class="mini-ring-fg" cx="28" cy="28" r="' + r + '" stroke="' + color + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + offset + '"></circle></svg>' +
    '<span>' + safePct + '%</span></div>';
}

function waterSegmentsHtml(value, target) {
  const total = Math.max(6, Math.min(10, target || 8));
  const filled = Math.min(total, Math.round(value || 0));
  return '<div class="water-segments" title="' + value + ' / ' + target + ' water target">' +
    Array.from({ length: total }, (_, i) => '<b class="' + (i < filled ? 'on' : '') + '"></b>').join('') + '</div>';
}

function isCompactMobile() {
  return !!(window.matchMedia && window.matchMedia('(max-width: 700px)').matches);
}

function macroDonutHtml(nutrition, calTarget) {
  const proteinCal = Math.max(0, nutrition.protein || 0) * 4;
  const carbCal = Math.max(0, nutrition.carbs || 0) * 4;
  const fatCal = Math.max(0, nutrition.fat || 0) * 9;
  const total = proteinCal + carbCal + fatCal;
  const p1 = total ? proteinCal / total * 100 : 0;
  const p2 = total ? (proteinCal + carbCal) / total * 100 : 0;
  const eatenPct = pctValue(nutrition.cal || 0, calTarget || 1);
  const bg = total
    ? 'conic-gradient(#2563eb 0 ' + p1.toFixed(1) + '%, #d97706 ' + p1.toFixed(1) + '% ' + p2.toFixed(1) + '%, #dc2626 ' + p2.toFixed(1) + '% 100%)'
    : 'conic-gradient(rgba(15,23,42,.08) 0 100%)';
  return '<div class="macro-donut-wrap"><div class="macro-donut" style="background:' + bg + '">' +
    '<div><strong>' + eatenPct + '%</strong><span>kcal</span></div></div>' +
    '<div class="macro-legend"><span><b style="background:#2563eb"></b>Protein</span><span><b style="background:#d97706"></b>Carbs</span><span><b style="background:#dc2626"></b>Fat</span></div></div>';
}

function getUnlockedRewards() {
  try {
    const key = 'rtRewards_' + (window._currentUser?.uid || 'guest');
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return [];
  }
}

function saveUnlockedRewards(ids) {
  try {
    localStorage.setItem('rtRewards_' + (window._currentUser?.uid || 'guest'), JSON.stringify(ids));
  } catch (e) {}
}

function unlockRewards(metrics) {
  const unlocked = new Set(getUnlockedRewards());
  const newly = [];
  REWARD_DEFS.forEach(r => {
    if (!unlocked.has(r.id) && r.test(metrics)) {
      unlocked.add(r.id);
      newly.push(r);
    }
  });
  if (newly.length) {
    saveUnlockedRewards([...unlocked]);
    newly.forEach((r, i) => {
      setTimeout(() => showToast('Reward unlocked: ' + r.name, 3200), i * 450);
    });
    if (typeof fireConfetti === 'function') fireConfetti();
  }
  return [...unlocked];
}

function rewardPanelHtml(metrics) {
  const unlocked = new Set(metrics.unlockedRewards);
  return '<div class="achievement-card"><div class="achievement-grid">' + REWARD_DEFS.map(r => {
      const isOn = unlocked.has(r.id);
      return '<div class="achievement-tile ' + (isOn ? 'unlocked' : '') + '" title="' + esc(r.desc) + '">' +
        '<i class="ti ' + r.icon + '"></i><span>' + esc(r.name) + '</span></div>';
    }).join('') + '</div></div>';
}

function questPanelHtml(metrics) {
  const remaining = metrics.totalCount - metrics.doneCount;
  let title = 'Daily mission';
  let desc = 'Log one meal, one movement session, and finish your top routines.';
  let icon = 'ti-target-arrow';
  let action = 'Open Today';
  let target = 'today';

  if (metrics.mealCount < 1) {
    desc = 'Start with your first meal log to keep the day measurable.';
    icon = 'ti-tools-kitchen-2';
    action = 'Log Food';
    target = 'meals';
  } else if (metrics.exerciseMin < 30) {
    desc = 'A 30 minute movement log will unlock today’s movement reward.';
    icon = 'ti-run';
    action = 'Log Exercise';
    target = 'exercise';
  } else if (remaining > 0) {
    desc = remaining + ' routine item' + (remaining > 1 ? 's' : '') + ' left for a perfect day bonus.';
  } else {
    title = 'Mission complete';
    desc = 'You cleared today. Come back tomorrow to protect the streak.';
    icon = 'ti-trophy';
  }

  return '<div class="quest-pro"><div class="quest-pro-icon"><i class="ti ' + icon + '"></i></div>' +
    '<div><div class="eyebrow">Comeback loop</div><h3>' + title + '</h3><p>' + desc + '</p>' +
    '<button class="btn p sm" onclick="showView(&quot;' + target + '&quot;)">' + action + '</button></div></div>';
}

function renderHome() {
  const m = getHomeMetrics();
  m.unlockedRewards = unlockRewards(m);
  if (isCompactMobile()) return renderMobileHome(m);
  return renderDesktopHome(m);
}

function renderDesktopHome(m) {
  const name = window._currentUser?.name ? esc(window._currentUser.name.split(' ')[0]) : 'Guest';
  const net = Math.round(m.nutrition.cal - m.exercise.calories);
  const proteinPct = pctValue(m.nutrition.protein, m.proteinTarget);
  const caloriesPct = pctValue(m.nutrition.cal, m.calTarget);
  const exercisePct = pctValue(m.exercise.minutes, m.exerciseTarget);
  const waterPct = pctValue(m.water, m.waterTarget);

  document.getElementById('hero-card').innerHTML =
    '<div class="health-hero">' +
      '<div class="score-orbit">' + ringSVG(m.readiness, '#34d399') + '<div><strong>' + m.readiness + '</strong><span>Score</span></div></div>' +
      '<div class="compact-score-meta"><div><span>Net calories</span><strong>' + net + '</strong></div>' +
      '<div><span>Day streak</span><strong>' + m.streak + 'd</strong></div></div>' +
    '</div>';

  document.getElementById('ring-grid').innerHTML =
    '<div class="metric-tile large" onclick="showView(&quot;meals&quot;)"><div class="metric-tile-top"><span>Calories remaining</span>' + miniMetricRing(caloriesPct, '#f59e0b', 'calories') + '</div><strong>' + m.calorieRemaining +
      '</strong><small>' + Math.round(m.nutrition.cal) + ' eaten · ' + Math.round(m.exercise.calories) + ' burned</small>' +
      '<div class="metric-track"><div style="width:' + caloriesPct + '%;background:#f59e0b"></div></div></div>' +
    '<div class="metric-tile" onclick="showView(&quot;meals&quot;)"><div class="metric-tile-top"><span>Protein</span>' + miniMetricRing(proteinPct, '#2563eb', 'protein') + '</div><strong>' + Math.round(m.nutrition.protein) + 'g</strong><small>' + proteinPct + '% target</small>' +
      '<div class="metric-track"><div style="width:' + proteinPct + '%;background:#2563eb"></div></div></div>' +
    '<div class="metric-tile" onclick="showView(&quot;exercise&quot;)"><div class="metric-tile-top"><span>Move minutes</span>' + miniMetricRing(exercisePct, '#ef4444', 'movement') + '</div><strong>' + Math.round(m.exercise.minutes) + 'm</strong><small>' + Math.round(m.exercise.calories) + ' kcal burned</small>' +
      '<div class="metric-track"><div style="width:' + exercisePct + '%;background:#ef4444"></div></div></div>' +
    '<div class="metric-tile" onclick="showView(&quot;today&quot;)"><div class="metric-tile-top"><span>Routine</span>' + miniMetricRing(m.todayAdh, '#159a7a', 'routine') + '</div><strong>' + m.todayAdh + '%</strong><small>' + m.doneCount + '/' + m.totalCount + ' complete</small>' +
      '<div class="metric-track"><div style="width:' + m.todayAdh + '%;background:#159a7a"></div></div></div>' +
    '<div class="metric-tile" onclick="showView(&quot;meals&quot;)"><div class="metric-tile-top"><span>Water</span>' + waterSegmentsHtml(m.water, m.waterTarget) + '</div><strong>' + m.water + '</strong><small>' + waterPct + '% target</small>' +
      '<div class="metric-track"><div style="width:' + waterPct + '%;background:#0891b2"></div></div></div>';

  document.getElementById('badge-strip').innerHTML =
    '<div class="nutrition-board"><div class="pro-panel-head"><div><div class="eyebrow">Macro balance</div><h3>Nutrition progress</h3></div><span class="level-chip">Target ' + m.calTarget + ' kcal</span></div>' +
    '<div class="macro-board-body">' + macroDonutHtml(m.nutrition, m.calTarget) + '<div>' +
    progressLine('Protein', m.nutrition.protein, m.proteinTarget, '#2563eb', 'g') +
    progressLine('Carbs', m.nutrition.carbs, Math.round(m.calTarget * 0.45 / 4), '#d97706', 'g') +
    progressLine('Fat', m.nutrition.fat, Math.round(m.calTarget * 0.25 / 9), '#dc2626', 'g') +
    '</div></div>' +
    '</div><div class="trend-card"><div class="pro-panel-head"><div><div class="eyebrow">Trend</div><h3>7-day adherence</h3></div><span class="level-chip">' + m.streak + 'd streak</span></div>' + weekTrendHtml() + '</div>';

  document.getElementById('quest-card').style.display = 'none';
  document.getElementById('quest-card').innerHTML = '';

  const achievementWrap = document.querySelector('#view-home .todo-mini-card');
  if (achievementWrap) achievementWrap.style.display = 'block';
  document.getElementById('todo-mini-list').innerHTML = rewardPanelHtml(m);
  const rewardCount = document.getElementById('todo-mini-count');
  if (rewardCount) rewardCount.textContent = '';
  const rewardTitle = document.querySelector('#view-home .todo-mini-hdr h4');
  if (rewardTitle) rewardTitle.innerHTML = '';

  processXPForToday({
    today: m.today,
    todayAdh: m.todayAdh,
    totalCount: m.totalCount,
    waterDone: m.water,
    waterTarget: m.waterTarget,
    exerciseMin: m.exerciseMin,
    mealCount: m.mealCount
    });
};

function mobileCornerMetric(cls, label, value, sub, target) {
  return '<button class="mobile-corner ' + cls + '" onclick="showView(&quot;' + target + '&quot;)">' +
    '<span>' + label + '</span><strong>' + value + '</strong><small>' + sub + '</small></button>';
}

function mobileMacroTile(label, value, target, suffix, color) {
  const pct = pctValue(value, target);
  return '<div class="mobile-macro-tile" style="--macro-color:' + color + '">' +
    '<span>' + label + '</span><strong>' + Math.round(value) + suffix + '</strong>' +
    '<small>' + pct + '% target</small><div><b style="width:' + pct + '%"></b></div></div>';
}

function renderMobileHome(m) {
  const net = Math.round(m.nutrition.cal - m.exercise.calories);
  const proteinPct = pctValue(m.nutrition.protein, m.proteinTarget);
  const caloriesPct = pctValue(m.nutrition.cal, m.calTarget);
  const exercisePct = pctValue(m.exercise.minutes, m.exerciseTarget);
  const waterPct = pctValue(m.water, m.waterTarget);
  const pending = m.routine.all.filter(i => !isCompleted(i.id, m.today)).slice(0, 3);
  const unlockedCount = m.unlockedRewards.length;

  document.getElementById('hero-card').innerHTML =
    '<div class="mobile-score-card">' +
      '<div class="mobile-score-center">' +
        ringSVG(m.readiness, '#34d399') +
        '<div><strong>' + m.readiness + '</strong><span>score</span></div>' +
      '</div>' +
      mobileCornerMetric('tl', 'Calories', m.calorieRemaining, 'remaining', 'meals') +
      mobileCornerMetric('tr', 'Protein', Math.round(m.nutrition.protein) + 'g', proteinPct + '% target', 'meals') +
      mobileCornerMetric('bl', 'Water', m.water + '/' + m.waterTarget, waterPct + '% target', 'meals') +
      mobileCornerMetric('br', 'Move', Math.round(m.exercise.minutes) + 'm', exercisePct + '% goal', 'exercise') +
    '</div>';

  document.getElementById('ring-grid').innerHTML =
    '<div class="mobile-module mobile-next-module"><div class="mobile-module-head"><span>Next up</span><button onclick="showView(&quot;today&quot;)">Today</button></div>' +
      '<div class="mobile-chip-row">' + (pending.length ? pending.map(it =>
        '<button class="mobile-task-chip" onclick="showView(&quot;today&quot;)"><i class="ti ti-circle"></i><span>' + esc(it.name) + '</span>' + (it.time ? '<small>' + esc(it.time) + '</small>' : '') + '</button>'
      ).join('') : '<div class="mobile-empty-line">All clear for now.</div>') + '</div></div>';

  document.getElementById('badge-strip').innerHTML =
    '<div class="mobile-module mobile-nutrition-module"><div class="mobile-module-head"><span>Nutrition</span><button onclick="showView(&quot;meals&quot;)">Meals</button></div>' +
      '<div class="mobile-macro-grid">' +
        mobileMacroTile('Calories', m.nutrition.cal, m.calTarget, '', '#f59e0b') +
        mobileMacroTile('Protein', m.nutrition.protein, m.proteinTarget, 'g', '#2563eb') +
        mobileMacroTile('Carbs', m.nutrition.carbs, Math.round(m.calTarget * 0.45 / 4), 'g', '#d97706') +
        mobileMacroTile('Fat', m.nutrition.fat, Math.round(m.calTarget * 0.25 / 9), 'g', '#dc2626') +
      '</div></div>' +
    '<div class="mobile-module mobile-trend-module"><div class="mobile-module-head"><span>7-day trend</span><strong>' + m.streak + 'd streak</strong></div>' + weekTrendHtml() + '</div>';

  document.getElementById('quest-card').style.display = 'none';
  document.getElementById('quest-card').innerHTML = '';

  const achievementWrap = document.querySelector('#view-home .todo-mini-card');
  if (achievementWrap) achievementWrap.style.display = 'block';
  const rewardCount = document.getElementById('todo-mini-count');
  if (rewardCount) rewardCount.textContent = unlockedCount + '/' + REWARD_DEFS.length;
  const rewardTitle = document.querySelector('#view-home .todo-mini-hdr h4');
  if (rewardTitle) rewardTitle.innerHTML = '<i class="ti ti-award" style="margin-right:5px;color:var(--teal)"></i>achievements';
  document.getElementById('todo-mini-list').innerHTML =
    '<div class="mobile-achievement-summary">' + REWARD_DEFS.slice(0, 4).map(r => {
      const on = m.unlockedRewards.includes(r.id);
      return '<div class="' + (on ? 'on' : '') + '"><i class="ti ' + r.icon + '"></i><span>' + esc(r.name) + '</span></div>';
    }).join('') + '</div>';

  processXPForToday({
    today: m.today,
    todayAdh: m.todayAdh,
    totalCount: m.totalCount,
    waterDone: m.water,
    waterTarget: m.waterTarget,
    exerciseMin: m.exerciseMin,
    mealCount: m.mealCount
  });
}

let _lastHomeCompactMode = null;
let _homeResizeTimer = null;
function bindHomeResponsiveRenderer() {
  if (!window.matchMedia) return;
  _lastHomeCompactMode = isCompactMobile();
  window.addEventListener('resize', () => {
    clearTimeout(_homeResizeTimer);
    _homeResizeTimer = setTimeout(() => {
      const nextMode = isCompactMobile();
      if (nextMode === _lastHomeCompactMode) return;
      _lastHomeCompactMode = nextMode;
      if (currentView === 'home') renderHome();
    }, 160);
  });
}
bindHomeResponsiveRenderer();

function awardDailyActionXP(kind, amount, maxCount) {
  const key = 'rtActionXP_' + todayStr() + '_' + (window._currentUser?.uid || 'guest');
  let stateForDay;
  try { stateForDay = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { stateForDay = {}; }
  const current = stateForDay[kind] || 0;
  if (current >= maxCount) return;
  stateForDay[kind] = current + 1;
  try { localStorage.setItem(key, JSON.stringify(stateForDay)); } catch (e) {}
  awardXP(amount, kind);
}

const _proLogFoodEntry = logFoodEntry;
logFoodEntry = function() {
  const before = (state.mealLogs[state.mealDate] || []).length;
  _proLogFoodEntry();
  const after = (state.mealLogs[state.mealDate] || []).length;
  if (after > before) awardDailyActionXP('food_log', 8, 4);
};

const _proLogExerciseEntry = logExerciseEntry;
logExerciseEntry = function() {
  const d = state.exerciseDate || todayStr();
  const before = ((state.exerciseLogs && state.exerciseLogs[d]) || []).length;
  _proLogExerciseEntry();
  const after = ((state.exerciseLogs && state.exerciseLogs[d]) || []).length;
  if (after > before) awardDailyActionXP('exercise_log', 14, 2);
};

const _proSaveWorkEntry = saveWorkEntry;
saveWorkEntry = function() {
  const before = (state.workLogs[state.workDate] || []).length;
  _proSaveWorkEntry();
  const after = (state.workLogs[state.workDate] || []).length;
  if (after > before) awardDailyActionXP('work_log', 6, 2);
};

function showOnboarding() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;
  const s = getSettings();
  document.getElementById('ob-cal').value = s.calTarget || 2000;
  document.getElementById('ob-protein').value = s.proteinTarget || 120;
  document.getElementById('ob-water').value = s.waterTarget || 8;
  document.getElementById('ob-weight').value = s.currentWeight || '';
  document.getElementById('ob-goal').value = s.primaryGoal || 'fat-loss';
  document.getElementById('ob-training').value = s.trainingStyle || 'balanced';
  modal.style.display = 'flex';
}

function hideOnboarding() {
  const modal = document.getElementById('onboarding-modal');
  if (modal) modal.style.display = 'none';
}

function saveOnboarding() {
  const s = getSettings();
  s.primaryGoal = document.getElementById('ob-goal').value;
  s.trainingStyle = document.getElementById('ob-training').value;
  s.calTarget = parseInt(document.getElementById('ob-cal').value) || s.calTarget;
  s.proteinTarget = parseInt(document.getElementById('ob-protein').value) || s.proteinTarget;
  s.waterTarget = parseInt(document.getElementById('ob-water').value) || s.waterTarget;
  s.currentWeight = parseFloat(document.getElementById('ob-weight').value) || s.currentWeight;
  saveSettings(s);
  localStorage.setItem('rt_onboarded', '1');
  hideOnboarding();
  renderCurrent();
  showToast('Setup saved');
}

function maybeShowOnboarding() {
  if (localStorage.getItem('rt_onboarded')) return;
  setTimeout(() => { if (window._currentUser) showOnboarding(); }, 900);
}

const _origRenderCurrentOrBoot = renderCurrentOrBoot;
renderCurrentOrBoot = function() {
  _origRenderCurrentOrBoot();
  maybeShowOnboarding();
};

function openAuthScreen() {
  if (typeof window.showAuthScreen === 'function') {
    window.showAuthScreen();
    return;
  }
  const el = document.getElementById('auth-screen');
  if (el) el.style.display = 'flex';
}
window.openAuthScreen = openAuthScreen;
