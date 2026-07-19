const DEFAULT_SETTINGS = {
  name: 'My Routine',
  calTarget: 2000, proteinTarget: 120, carbsTarget: 250, fatTarget: 65,
  waterTarget: 8,
  weightUnit: 'kg',
  theme: 'system', // 'light' | 'dark' | 'system'
  bodyFatGoal: 20,
  currentWeight: null,
};

function getSettings() {
  try {
    const s = localStorage.getItem('rtSettings');
    return s ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(s)) : { ...DEFAULT_SETTINGS };
  } catch(e) { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(s) {
  try { localStorage.setItem('rtSettings', JSON.stringify(s)); } catch(e) {}
  applyTheme(s.theme);
}
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark')  root.setAttribute('data-theme','dark');
  else if (theme === 'light') root.setAttribute('data-theme','light');
  else root.removeAttribute('data-theme');
}

function renderSettings() {
  const s = getSettings();
  document.getElementById('set-name').value        = s.name;
  document.getElementById('set-cal').value         = s.calTarget;
  document.getElementById('set-protein').value     = s.proteinTarget;
  document.getElementById('set-carbs').value       = s.carbsTarget;
  document.getElementById('set-fat').value         = s.fatTarget;
  document.getElementById('set-water').value       = s.waterTarget;
  document.getElementById('set-bfgoal').value      = s.bodyFatGoal;
  document.getElementById('set-wunit').value       = s.weightUnit;
  document.getElementById('set-theme').value       = s.theme;
}
function saveSettingsForm() {
  const s = getSettings();
  s.name           = document.getElementById('set-name').value.trim() || 'My Routine';
  s.calTarget      = parseInt(document.getElementById('set-cal').value)     || 2000;
  s.proteinTarget  = parseInt(document.getElementById('set-protein').value) || 120;
  s.carbsTarget    = parseInt(document.getElementById('set-carbs').value)   || 250;
  s.fatTarget      = parseInt(document.getElementById('set-fat').value)     || 65;
  s.waterTarget    = parseInt(document.getElementById('set-water').value)   || 8;
  s.bodyFatGoal    = parseFloat(document.getElementById('set-bfgoal').value)|| 20;
  s.weightUnit     = document.getElementById('set-wunit').value;
  s.theme          = document.getElementById('set-theme').value;
  saveSettings(s);
  document.querySelector('.topbar-title span') && (document.querySelector('.topbar-title span').textContent = s.name);
  showToast('Settings saved ✓');
}

// ═══════════════════════════════════════════════════════════════════
// BODY METRICS LOG
// ═══════════════════════════════════════════════════════════════════
function renderMetrics() {
  const settings   = getSettings();
  const metrics    = state.bodyMetrics || [];
  const sorted     = [...metrics].sort((a,b) => a.date.localeCompare(b.date));
  const latest     = sorted[sorted.length - 1];
  const goal       = settings.bodyFatGoal || 20;
  const wunit      = settings.weightUnit || 'kg';

  // Summary cards
  const bfNow  = latest?.bodyFat  ?? null;
  const wtNow  = latest?.weight   ?? null;
  const bfDiff = metrics.length >= 2 ? (bfNow - sorted[sorted.length - 2].bodyFat).toFixed(1) : null;
  const wtDiff = metrics.length >= 2 ? (wtNow - sorted[sorted.length - 2].weight).toFixed(1)  : null;

  document.getElementById('metrics-cards').innerHTML = `
    <div class="mc"><div class="ml">body fat</div>
      <div class="mv ${bfNow<=goal?'green':bfNow<=goal+5?'amber':'red'}">${bfNow !== null ? bfNow+'%' : '—'}</div>
      ${bfDiff !== null ? `<div style="font-size:11px;color:${bfDiff<0?'var(--teal)':'var(--red)'};margin-top:2px">${bfDiff>0?'+':''}${bfDiff}% vs prev</div>` : ''}
    </div>
    <div class="mc"><div class="ml">weight (${wunit})</div>
      <div class="mv">${wtNow !== null ? wtNow : '—'}</div>
      ${wtDiff !== null ? `<div style="font-size:11px;color:var(--txt3);margin-top:2px">${wtDiff>0?'+':''}${wtDiff} vs prev</div>` : ''}
    </div>
    <div class="mc"><div class="ml">bf goal</div>
      <div class="mv green">${goal}%</div>
    </div>
    <div class="mc"><div class="ml">entries</div>
      <div class="mv">${metrics.length}</div>
    </div>`;

  // Chart
  if (window._metricsChart) { try { window._metricsChart.destroy(); } catch(e) {} }
  const ctx = document.getElementById('chart-metrics');
  if (ctx && sorted.length >= 2) {
    window._metricsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sorted.map(m => fmtShort(m.date)),
        datasets: [
          { label: 'Body Fat %', data: sorted.map(m => m.bodyFat),
            borderColor: '#D85A30', backgroundColor: 'rgba(216,90,48,.08)',
            tension: .35, fill: true, pointRadius: 4, yAxisID: 'y1' },
          { label: `Weight (${wunit})`, data: sorted.map(m => m.weight),
            borderColor: '#185FA5', backgroundColor: 'rgba(24,95,165,.06)',
            tension: .35, fill: false, pointRadius: 4, yAxisID: 'y2', borderDash: [4,3] },
          { label: 'BF Goal', data: sorted.map(() => goal),
            borderColor: '#1D9E75', borderDash: [6,4], pointRadius: 0,
            borderWidth: 1.5, fill: false, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12, padding: 8 } } },
        scales: {
          y1: { position: 'left',  ticks: { callback: v => v+'%', font: { size: 11 } }, grid: { color: 'rgba(128,128,128,.1)' } },
          y2: { position: 'right', ticks: { font: { size: 11 } }, grid: { display: false } },
          x:  { ticks: { maxTicksLimit: 10, font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  } else if (ctx && sorted.length === 1) {
    // single entry — still draw
    window._metricsChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: ['Body Fat %', `Weight (${wunit})`],
        datasets: [{ data: [sorted[0].bodyFat, sorted[0].weight],
          backgroundColor: ['rgba(216,90,48,.7)', 'rgba(24,95,165,.7)'],
          borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { ticks: { font: { size: 11 } } }, x: { ticks: { font: { size: 11 } } } } }
    });
  }

  // History table
  const tbody = document.getElementById('metrics-history');
  if (!sorted.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--txt3);font-size:13px">no entries yet</td></tr>'; return; }
  tbody.innerHTML = [...sorted].reverse().slice(0, 30).map(m => `
    <tr style="border-bottom:.5px solid var(--bdr)">
      <td style="padding:7px 8px;font-size:13px">${fmtShort(m.date)}</td>
      <td style="padding:7px 8px;font-size:13px;font-weight:600;color:${m.bodyFat<=goal?'var(--teal)':'var(--txt)'}">${m.bodyFat}%</td>
      <td style="padding:7px 8px;font-size:13px">${m.weight} ${wunit}</td>
      <td style="padding:7px 8px;font-size:13px;color:var(--txt2)">${m.note||'—'}</td>
      <td style="padding:7px 8px"><button onclick="deleteMetric('${m.id}')" style="border:none;background:transparent;cursor:pointer;color:var(--txt3);font-size:13px"><i class="ti ti-trash"></i></button></td>
    </tr>`).join('');
}

function logMetric() {
  const bf  = parseFloat(document.getElementById('inp-bf').value);
  const wt  = parseFloat(document.getElementById('inp-wt').value);
  const note = document.getElementById('inp-metric-note').value.trim();
  const date = document.getElementById('inp-metric-date').value;
  if (isNaN(bf) || isNaN(wt)) { alert('please enter both body fat % and weight'); return; }
  if (!state.bodyMetrics) state.bodyMetrics = [];
  state.bodyMetrics.push({ id: Date.now().toString(), date, bodyFat: bf, weight: wt, note });
  document.getElementById('inp-bf').value = '';
  document.getElementById('inp-wt').value = '';
  document.getElementById('inp-metric-note').value = '';
  save(); renderMetrics();
  showToast('Measurement logged ✓');
}
function deleteMetric(id) {
  if (!confirm('delete this entry?')) return;
  state.bodyMetrics = (state.bodyMetrics || []).filter(m => m.id !== id);
  save(); renderMetrics();
}

// ═══════════════════════════════════════════════════════════════════
// WATER TRACKER
// ═══════════════════════════════════════════════════════════════════
function getWaterToday() {
  const d = state.mealDate || todayStr();
  return (state.waterLog || {})[d] || 0;
}
function addWater(n) {
  const d = state.mealDate || todayStr();
  if (!state.waterLog) state.waterLog = {};
  state.waterLog[d] = Math.max(0, (state.waterLog[d] || 0) + n);
  save(); renderWaterWidget();
}
function renderWaterWidget() {
  const s    = getSettings();
  const target = s.waterTarget || 8;
  const done   = getWaterToday();
  const pct    = Math.min(Math.round(done / target * 100), 100);
  const el     = document.getElementById('water-widget');
  if (!el) return;
  const glasses = Array.from({ length: target }, (_, i) =>
    `<button class="water-glass ${i < done ? 'on' : ''}" onclick="addWater(${i < done ? -1 : 1})" title="${i < done ? 'tap to remove one glass' : 'tap to add one glass'}">
      <i class="ti ${i < done ? 'ti-droplet-filled' : 'ti-droplet'}"></i>
    </button>`).join('');
  el.innerHTML = `
    <div class="water-head">
      <div>
        <span class="water-label"><i class="ti ti-droplet"></i> water intake</span>
        <small>${pct>=100?'Target complete':'Tap glasses or use quick add'}</small>
      </div>
      <strong style="color:${pct>=100?'var(--teal)':'var(--blu)'}">${done} / ${target}</strong>
    </div>
    <div class="water-glasses">${glasses}</div>
    <div class="water-actions">
      <button onclick="addWater(-1)" ${done<=0?'disabled':''}><i class="ti ti-minus"></i> remove</button>
      <button onclick="addWater(1)"><i class="ti ti-plus"></i> add glass</button>
      <button onclick="addWater(2)"><i class="ti ti-plus"></i> add 2</button>
    </div>
    <div class="dn-bar"><div class="dn-bar-fill" style="width:${pct}%;background:var(--blu)"></div></div>`;
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOM FOOD & MEAL TEMPLATES
// ═══════════════════════════════════════════════════════════════════
function getCustomFoods() {
  try { return JSON.parse(localStorage.getItem('customFoods') || '[]'); } catch(e) { return []; }
}
function saveCustomFoods(arr) {
  try { localStorage.setItem('customFoods', JSON.stringify(arr)); } catch(e) {}
}
function getMealTemplates() {
  try { return JSON.parse(localStorage.getItem('mealTemplates') || '[]'); } catch(e) { return []; }
}
function saveMealTemplates(arr) {
  try { localStorage.setItem('mealTemplates', JSON.stringify(arr)); } catch(e) {}
}

function saveCustomFood() {
  const name = document.getElementById('cf-name').value.trim();
  const cal  = parseFloat(document.getElementById('cf-cal').value);
  const pro  = parseFloat(document.getElementById('cf-protein').value);
  const carb = parseFloat(document.getElementById('cf-carbs').value);
  const fat  = parseFloat(document.getElementById('cf-fat').value);
  const unit = document.getElementById('cf-unit').value;
  if (!name || isNaN(cal)) { alert('name and calories are required'); return; }
  const arr = getCustomFoods();
  arr.push({ id: Date.now().toString(), name, cal, protein: pro||0, carbs: carb||0, fat: fat||0, unit: unit||'serving', g: 100, custom: true });
  saveCustomFoods(arr);
  document.getElementById('cf-name').value = '';
  ['cf-cal','cf-protein','cf-carbs','cf-fat'].forEach(id => document.getElementById(id).value = '');
  renderCustomFoodsList();
  showToast('Custom food saved ✓');
}
function deleteCustomFood(id) {
  const arr = getCustomFoods().filter(f => f.id !== id);
  saveCustomFoods(arr);
  renderCustomFoodsList();
}
function renderCustomFoodsList() {
  const arr = getCustomFoods();
  const el  = document.getElementById('custom-foods-list');
  if (!el) return;
  el.innerHTML = arr.length ? arr.map(f => `
    <div class="ri" style="margin-bottom:6px">
      <div class="ibody">
        <div class="iname">${esc(f.name)}</div>
        <div class="imeta">
          <span style="color:var(--amb);font-weight:600">${f.cal} kcal</span>
          <span>P:${f.protein}g C:${f.carbs}g F:${f.fat}g</span>
          <span style="color:var(--txt3)">per ${f.unit}</span>
        </div>
      </div>
      <div class="iact"><button class="del" onclick="deleteCustomFood('${f.id}')"><i class="ti ti-trash"></i></button></div>
    </div>`).join('')
  : '<p style="font-size:13px;color:var(--txt3);padding:10px 0">no custom foods yet</p>';
}

function saveMealTemplate() {
  const d       = state.mealDate || todayStr();
  const entries = state.mealLogs[d] || [];
  const name    = document.getElementById('tmpl-name').value.trim();
  if (!name) { alert('give the template a name'); return; }
  if (!entries.length) { alert('log some food first, then save as template'); return; }
  const arr = getMealTemplates();
  arr.push({ id: Date.now().toString(), name, entries: entries.map(e => ({ ...e, id: Date.now() + Math.random() + '' })) });
  saveMealTemplates(arr);
  document.getElementById('tmpl-name').value = '';
  renderTemplatesList();
  showToast('Template saved ✓');
}
function applyTemplate(id) {
  const arr  = getMealTemplates();
  const tmpl = arr.find(t => t.id === id);
  if (!tmpl) return;
  const d    = state.mealDate || todayStr();
  if (!state.mealLogs[d]) state.mealLogs[d] = [];
  const newEntries = tmpl.entries.map(e => ({ ...e, id: Date.now() + Math.random() + '', time: new Date().toTimeString().slice(0, 5) }));
  state.mealLogs[d].push(...newEntries);
  save(); renderMeals();
  showToast(`Applied "${tmpl.name}" ✓`);
}
function deleteTemplate(id) {
  saveMealTemplates(getMealTemplates().filter(t => t.id !== id));
  renderTemplatesList();
}
function renderTemplatesList() {
  const arr = getMealTemplates();
  const el  = document.getElementById('templates-list');
  if (!el) return;
  el.innerHTML = arr.length ? arr.map(t => `
    <div class="ri" style="margin-bottom:6px">
      <div class="ibody">
        <div class="iname">${esc(t.name)}</div>
        <div class="imeta"><span style="color:var(--txt3)">${t.entries.length} items — ${t.entries.reduce((s,e)=>s+e.cal,0)} kcal</span></div>
      </div>
      <div class="iact" style="display:flex;gap:6px">
        <button onclick="applyTemplate('${t.id}')" style="padding:4px 8px;border-radius:var(--r);border:.5px solid var(--teal);background:var(--tl);color:var(--td);font-size:11px;cursor:pointer">apply</button>
        <button class="del" onclick="deleteTemplate('${t.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('')
  : '<p style="font-size:13px;color:var(--txt3);padding:10px 0">no templates saved yet</p>';
}

// ═══════════════════════════════════════════════════════════════════
// WEEKLY NUTRITION TRENDS (for Reports)
// ═══════════════════════════════════════════════════════════════════
function renderNutritionTrends() {
  const today   = todayStr();
  const n       = state.reportPeriod === 'week' ? 7 : state.reportPeriod === 'month' ? 30 : 90;
  const days    = Array.from({ length: n }, (_, i) => addDays(today, -(n - 1 - i)));
  const s       = getSettings();

  const dayData = days.map(d => {
    const entries = state.mealLogs[d] || [];
    const tot = entries.reduce((a, e) => ({ cal: a.cal+e.cal, protein: a.protein+e.protein, carbs: a.carbs+e.carbs, fat: a.fat+e.fat }), { cal:0, protein:0, carbs:0, fat:0 });
    return { d, ...tot, hasData: entries.length > 0 };
  }).filter(d => d.hasData);

  if (window._nutTrendChart) { try { window._nutTrendChart.destroy(); } catch(e) {} }
  const ctx = document.getElementById('chart-nut-trends');
  if (!ctx || !dayData.length) return;
  window._nutTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dayData.map(d => { const pd = parseDate(d.d); return pd.getDate()+' '+MONTHS[pd.getMonth()]; }),
      datasets: [
        { label: 'Calories', data: dayData.map(d => Math.round(d.cal)),   borderColor: '#BA7517', tension: .35, fill: false, pointRadius: 3, yAxisID: 'y1' },
        { label: 'Protein g', data: dayData.map(d => Math.round(d.protein)), borderColor: '#1D9E75', tension: .35, fill: false, pointRadius: 3, yAxisID: 'y2' },
        { label: 'Cal Target', data: dayData.map(() => s.calTarget),      borderColor: '#BA7517', borderDash: [5,4], pointRadius: 0, borderWidth: 1, yAxisID: 'y1' },
        { label: 'Pro Target', data: dayData.map(() => s.proteinTarget),  borderColor: '#1D9E75', borderDash: [5,4], pointRadius: 0, borderWidth: 1, yAxisID: 'y2' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 10, padding: 6 } } },
      scales: {
        y1: { position: 'left',  ticks: { callback: v => v+'cal', font: { size: 10 } }, grid: { color: 'rgba(128,128,128,.1)' } },
        y2: { position: 'right', ticks: { callback: v => v+'g',   font: { size: 10 } }, grid: { display: false } },
        x:  { ticks: { maxTicksLimit: 10, font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// HABIT CORRELATION ENGINE
// ═══════════════════════════════════════════════════════════════════
function computeHabitCorrelations() {
  const today  = todayStr();
  const days   = Array.from({ length: 30 }, (_, i) => addDays(today, -i)).filter(d => {
    return state.items.some(it => dayApplies(it, d));
  });
  if (days.length < 7) return [];

  const correlations = [];

  state.items.forEach(anchor => {
    const anchorDays    = days.filter(d => dayApplies(anchor, d));
    const anchorDone    = anchorDays.filter(d => isCompleted(anchor.id, d));
    const anchorMissed  = anchorDays.filter(d => !isCompleted(anchor.id, d));
    if (anchorDone.length < 3 || anchorMissed.length < 3) return;

    state.items.forEach(other => {
      if (other.id === anchor.id) return;
      const bothDays = anchorDays.filter(d => dayApplies(other, d));
      if (bothDays.length < 5) return;

      const doneWhenAnchorDone   = bothDays.filter(d => isCompleted(anchor.id, d) && isCompleted(other.id, d)).length;
      const totalWhenAnchorDone  = bothDays.filter(d => isCompleted(anchor.id, d)).length;
      const doneWhenAnchorMissed = bothDays.filter(d => !isCompleted(anchor.id, d) && isCompleted(other.id, d)).length;
      const totalWhenAnchorMissed= bothDays.filter(d => !isCompleted(anchor.id, d)).length;

      if (!totalWhenAnchorDone || !totalWhenAnchorMissed) return;
      const rateDone   = Math.round(doneWhenAnchorDone   / totalWhenAnchorDone   * 100);
      const rateMissed = Math.round(doneWhenAnchorMissed / totalWhenAnchorMissed * 100);
      const diff = rateDone - rateMissed;

      if (Math.abs(diff) >= 20) {
        correlations.push({ anchor: anchor.name, other: other.name, rateDone, rateMissed, diff, positive: diff > 0 });
      }
    });
  });

  return correlations.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 6);
}

function renderHabitCorrelations() {
  const el   = document.getElementById('habit-correlations');
  if (!el) return;
  const corr = computeHabitCorrelations();
  if (!corr.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--txt2)">Need at least 7 days of data with varied completion to detect patterns. Keep logging!</p>';
    return;
  }
  el.innerHTML = corr.map(c => `
    <div style="background:var(--bg2);border-radius:var(--r);padding:12px;margin-bottom:8px">
      <div style="font-size:13px;margin-bottom:5px;line-height:1.5">
        ${c.positive
          ? `✅ When you complete <strong>${esc(c.anchor)}</strong>, you do <strong>${esc(c.other)}</strong> <strong style="color:var(--teal)">${c.rateDone}%</strong> of the time vs <strong style="color:var(--red)">${c.rateMissed}%</strong> when you skip it.`
          : `⚠️ Skipping <strong>${esc(c.anchor)}</strong> doesn't hurt <strong>${esc(c.other)}</strong> much (${c.rateMissed}% vs ${c.rateDone}%).`
        }
      </div>
      <div style="font-size:11px;color:var(--txt3)">${Math.abs(c.diff)}% difference — ${c.positive ? c.anchor+' unlocks '+c.other : 'these habits are independent'}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT (PDF-ready HTML + CSV)
// ═══════════════════════════════════════════════════════════════════
function exportCSV() {
  const today = todayStr();
  const n     = 90;
  const days  = Array.from({ length: n }, (_, i) => addDays(today, -(n-1-i)));
  const rows  = [['Date','Task','Category','Completed','Calories','Protein','Carbs','Fat','Work Tasks']];

  days.forEach(d => {
    state.items.filter(it => dayApplies(it, d)).forEach(it => {
      rows.push([d, it.name, it.category, isCompleted(it.id, d) ? 'yes' : 'no', '', '', '', '', '']);
    });
    const entries = state.mealLogs[d] || [];
    if (entries.length) {
      const tot = entries.reduce((a,e) => ({ cal: a.cal+e.cal, p: a.p+e.protein, c: a.c+e.carbs, f: a.f+e.fat }), { cal:0,p:0,c:0,f:0 });
      rows.push([d, '(Nutrition Total)', 'meal', '', Math.round(tot.cal), tot.p.toFixed(1), tot.c.toFixed(1), tot.f.toFixed(1), '']);
    }
    const workEntries = state.workLogs[d] || [];
    const tasks = workEntries.flatMap(e => e.tasks).join('; ');
    if (tasks) rows.push([d, '(Work Log)', 'work', '', '', '', '', '', tasks]);
  });

  const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'routine-export.csv'; a.click();
  URL.revokeObjectURL(url);
}

function exportWeeklyHTML() {
  const today = todayStr();
  const days  = Array.from({ length: 7 }, (_, i) => addDays(today, -(6-i)));
  const s     = getSettings();

  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Weekly Report – ${fmtDate(today)}</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:700px;margin:40px auto;color:#1a1a18;padding:0 20px}
    h1{font-size:22px;font-weight:700;margin-bottom:4px;color:#085041}
    .sub{color:#6b6b66;font-size:14px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px}
    th{background:#E1F5EE;color:#085041;padding:8px 10px;text-align:left;font-weight:600}
    td{padding:8px 10px;border-bottom:.5px solid #efefeb}
    .g{color:#1D9E75;font-weight:600}.r{color:#E24B4A;font-weight:600}.a{color:#BA7517;font-weight:600}
    .section{font-size:15px;font-weight:600;margin:20px 0 8px;border-bottom:1px solid #efefeb;padding-bottom:6px}
    .chip{display:inline-block;background:#E6F1FB;color:#185FA5;border-radius:20px;padding:2px 8px;font-size:11px;margin:2px}
  </style></head><body>
  <h1>Weekly Report — ${s.name}</h1>
  <div class="sub">${fmtDate(days[0])} → ${fmtDate(today)}</div>
  <div class="section">Routine Adherence</div>
  <table><tr><th>Day</th><th>Done</th><th>Adherence</th><th>Key tasks missed</th></tr>`;

  days.forEach(d => {
    const all    = state.items.filter(it => dayApplies(it, d));
    const done   = all.filter(it => isCompleted(it.id, d));
    const missed = all.filter(it => !isCompleted(it.id, d));
    const adh    = all.length ? Math.round(done.length / all.length * 100) : null;
    const cls    = adh === null ? '' : adh >= 80 ? 'g' : adh >= 50 ? 'a' : 'r';
    const pd     = parseDate(d);
    html += `<tr>
      <td>${FULLDAY[pd.getDay()]} ${pd.getDate()}</td>
      <td>${done.length}/${all.length}</td>
      <td class="${cls}">${adh !== null ? adh+'%' : '—'}</td>
      <td>${missed.slice(0,3).map(m => m.name).join(', ') || '—'}</td>
    </tr>`;
  });
  html += '</table>';

  html += '<div class="section">Work Log</div><table><tr><th>Day</th><th>Tasks Completed</th></tr>';
  days.forEach(d => {
    const tasks = (state.workLogs[d] || []).flatMap(e => e.tasks);
    const pd    = parseDate(d);
    if (tasks.length) {
      html += `<tr><td>${FULLDAY[pd.getDay()]} ${pd.getDate()}</td><td>${tasks.map(t => `<span class="chip">${esc(t)}</span>`).join(' ')}</td></tr>`;
    }
  });
  html += '</table>';

  html += '<div class="section">Nutrition Summary</div><table><tr><th>Day</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr>';
  days.forEach(d => {
    const entries = state.mealLogs[d] || [];
    if (!entries.length) return;
    const tot = entries.reduce((a,e) => ({ cal:a.cal+e.cal, p:a.p+e.protein, c:a.c+e.carbs, f:a.f+e.fat }), { cal:0,p:0,c:0,f:0 });
    const pd  = parseDate(d);
    const calCls = tot.cal > s.calTarget * 1.1 ? 'r' : tot.cal >= s.calTarget * 0.9 ? 'g' : 'a';
    html += `<tr><td>${FULLDAY[pd.getDay()]} ${pd.getDate()}</td>
      <td class="${calCls}">${Math.round(tot.cal)}</td>
      <td>${tot.p.toFixed(1)}g</td><td>${tot.c.toFixed(1)}g</td><td>${tot.f.toFixed(1)}g</td>
    </tr>`;
  });
  html += `</table><p style="font-size:12px;color:#9e9e98;margin-top:32px">Generated by Routine Tracker on ${new Date().toLocaleString()}</p>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'weekly-report.html'; a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════
// EDIT WORK ENTRY
// ═══════════════════════════════════════════════════════════════════
function editWorkEntry(d, id) {
  const entry = (state.workLogs[d] || []).find(e => e.id === id);
  if (!entry) return;
  state.editingWorkEntry = { d, id };
  state.taskChips = [...entry.tasks];
  document.getElementById('work-note').value = entry.note || '';
  renderTaskChips();
  document.getElementById('work-save-btn').textContent = '💾 update entry';
  document.getElementById('work-form').scrollIntoView({ behavior: 'smooth' });
}

// ═══════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════
function showToast(msg, duration = 2500) {
  let toast = document.getElementById('toast-el');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-el';
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a1a18;color:#fff;padding:8px 18px;border-radius:20px;font-size:13px;z-index:9999;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

// ═══════════════════════════════════════════════════════════════════
// MONTH-OVER-MONTH COMPARISON
// ═══════════════════════════════════════════════════════════════════
function renderMoMComparison() {
  const today   = todayStr();
  const thisM   = Array.from({ length: 30 }, (_, i) => addDays(today, -i));
  const lastM   = Array.from({ length: 30 }, (_, i) => addDays(today, -(30+i)));

  const avg = days => {
    const valid = days.map(d => getAdherence(d)).filter(a => a !== null);
    return valid.length ? Math.round(valid.reduce((s,a) => s+a, 0) / valid.length) : 0;
  };
  const nutAvg = days => {
    const valid = days.map(d => {
      const e = state.mealLogs[d] || [];
      return e.length ? e.reduce((s,x) => s+x.cal, 0) : null;
    }).filter(x => x !== null);
    return valid.length ? Math.round(valid.reduce((s,a) => s+a, 0) / valid.length) : 0;
  };
  const workAvg = days => {
    const valid = days.map(d => (state.workLogs[d]||[]).flatMap(e=>e.tasks).length).filter(n=>n>0);
    return valid.length ? (valid.reduce((s,n) => s+n, 0) / valid.length).toFixed(1) : 0;
  };

  const rows = [
    { label:'Avg Adherence',   this: avg(thisM)+'%',    last: avg(lastM)+'%',    better: avg(thisM) >= avg(lastM) },
    { label:'Avg Calories/day', this: nutAvg(thisM),    last: nutAvg(lastM),     better: null },
    { label:'Avg Work Tasks/day',this: workAvg(thisM),  last: workAvg(lastM),   better: parseFloat(workAvg(thisM)) >= parseFloat(workAvg(lastM)) },
    { label:'Streak (current)', this: calcStreak()+'d', last: '—',              better: true },
  ];

  const el = document.getElementById('mom-comparison');
  if (!el) return;
  el.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <tr style="border-bottom:.5px solid var(--bdr)">
      <th style="text-align:left;padding:6px 8px;color:var(--txt2);font-size:11px;font-weight:600;text-transform:uppercase">metric</th>
      <th style="text-align:center;padding:6px 8px;color:var(--teal);font-size:11px;font-weight:600">this month</th>
      <th style="text-align:center;padding:6px 8px;color:var(--txt3);font-size:11px;font-weight:600">last month</th>
    </tr>
    ${rows.map(r => `<tr style="border-bottom:.5px solid var(--bdr)">
      <td style="padding:7px 8px">${r.label}</td>
      <td style="text-align:center;padding:7px 8px;font-weight:600;color:${r.better===null?'var(--txt)':r.better?'var(--teal)':'var(--red)'}">${r.this}</td>
      <td style="text-align:center;padding:7px 8px;color:var(--txt3)">${r.last}</td>
    </tr>`).join('')}
  </table>`;
}
// ═══════════════════════════════════════════════════════════════════
// END MEAL LOGGER
// ═══════════════════════════════════════════════════════════════════
