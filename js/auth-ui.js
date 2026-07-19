// REMINDERS
// ═══════════════════════════════════════════════════════════════════
function checkReminders(){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const today=todayStr(),now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  state.items.forEach(it=>{
    if(!dayApplies(it,today)||isCompleted(it.id,today)||!it.time)return;
    const[h,m]=it.time.split(':').map(Number),diff=h*60+m-nowMin,remind=it.remind||5;
    if(diff>=0&&diff<=remind)new Notification('⏰ '+it.name,{body:'Scheduled for '+it.time});
  });
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ═══════════════════════════════════════════════════════════════════
// AUTH HELPERS (called from HTML onclick)
// ═══════════════════════════════════════════════════════════════════
let _authMode = 'signin';
function switchAuthTab(mode) {
  _authMode = mode;
  document.getElementById('tab-signin').classList.toggle('active', mode==='signin');
  document.getElementById('tab-signup').classList.toggle('active', mode==='signup');
  document.getElementById('auth-signup-name').style.display = mode==='signup' ? 'block' : 'none';
  document.getElementById('auth-submit-btn').textContent = mode==='signin' ? 'sign in' : 'create account';
  document.getElementById('auth-error').textContent = '';
  if (!window.FIREBASE_READY) {
    document.getElementById('auth-offline-note').textContent =
      mode==='signup'
        ? '⚠ Offline mode: accounts are stored on this device only. Enable Firebase for true multi-device sync.'
        : '⚠ Offline mode: using local account storage.';
  }
}
async function doAuth() {
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  const name  = (document.getElementById('auth-name')?.value||'').trim() || email.split('@')[0];
  const errEl = document.getElementById('auth-error');
  const btn   = document.getElementById('auth-submit-btn');
  errEl.textContent = '';
  if (!email || !pass) { errEl.textContent = 'Please fill in all fields'; return; }
  if (pass.length < 6) { errEl.textContent = 'Password must be at least 6 characters'; return; }
  // Guard: auth functions must be initialised by the module script
  if (!window._authSignIn || !window._authSignUp) {
    errEl.textContent = 'App still loading, please wait a moment and try again';
    return;
  }
  const label = _authMode === 'signin' ? 'Sign in' : 'Create account';
  btn.textContent = 'Please wait…'; btn.disabled = true;
  try {
    if (_authMode === 'signup') await window._authSignUp(email, pass, name);
    else                        await window._authSignIn(email, pass);
    // success — hideAuthScreen() is called by the auth module
  } catch(e) {
    const msg = (e.message||'Unknown error')
      .replace('Firebase: ','')
      .replace(/\(auth\/[^)]+\)/g,'')
      .replace('auth/invalid-credential','Invalid email or password')
      .replace('auth/email-already-in-use','Email already registered')
      .replace('auth/weak-password','Password too weak (min 6 chars)')
      .replace('auth/user-not-found','No account with that email')
      .trim();
    errEl.textContent = msg || 'Sign in failed — please try again';
  } finally {
    btn.textContent = label; btn.disabled = false;
  }
}
async function sendPasswordReset() {
  const email = document.getElementById('auth-email').value.trim();
  const errEl = document.getElementById('auth-error');
  const btn = document.getElementById('forgot-password-btn');
  errEl.textContent = '';
  if (!email) {
    errEl.textContent = 'Enter your email first, then tap forgot password.';
    return;
  }
  if (!window._authResetPassword) {
    errEl.textContent = 'App still loading, please wait a moment and try again.';
    return;
  }
  const oldText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'sending...'; }
  try {
    await window._authResetPassword(email);
    errEl.style.color = 'var(--teal)';
    errEl.textContent = 'Password reset email sent. Check your inbox.';
  } catch(e) {
    errEl.style.color = 'var(--red)';
    const msg = (e.message||'Password reset failed')
      .replace('Firebase: ','')
      .replace(/\(auth\/[^)]+\)/g,'')
      .replace('auth/user-not-found','No account with that email')
      .replace('auth/invalid-email','Enter a valid email')
      .trim();
    errEl.textContent = msg || 'Password reset failed. Please try again.';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = oldText || 'forgot password?'; }
  }
}
function doSignOut() {
  if (!confirm('sign out?')) return;
  // reset in-memory state for next user
  state.items=[]; state.completions={}; state.workLogs={};
  state.mealLogs={}; state.exerciseLogs={}; state.bodyMetrics=[]; state.waterLog={};
  window._authSignOut();
}
function updateUserBadge() {
  const u = window._currentUser;
  const badge = document.getElementById('user-badge');
  const avatar = document.getElementById('user-avatar');
  const nameEl = document.getElementById('user-name-badge');
  const signinBtn = document.getElementById('signin-open-btn');
  if (!badge) return;
  if (u && u.uid !== 'guest') {
    badge.style.display = 'flex';
    if (signinBtn) signinBtn.style.display = 'none';
    const initials = (u.name||u.email).split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    avatar.textContent = initials;
    if (nameEl) nameEl.textContent = u.name || u.email;
  } else {
    badge.style.display = 'none';
    if (signinBtn && typeof showAuthScreen === 'function') signinBtn.style.display = 'flex';
  }
}
function renderCurrentOrBoot() {
  if (!state.items.length) { state.items = MY_ROUTINE; save(); }
  const _s = getSettings();
  applyTheme(_s.theme);
  setSyncDot(window.FIREBASE_READY ? 'live' : 'off');
  renderHome();
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
}

// ═══════════════════════════════════════════════════════════════════
