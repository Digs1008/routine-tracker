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
function setAuthMessage(msg, tone) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.style.color = tone === 'ok' ? 'var(--teal)' : tone === 'info' ? 'var(--txt2)' : 'var(--red)';
  el.textContent = msg;
}
function switchAuthTab(mode) {
  _authMode = mode;
  document.getElementById('tab-signin').classList.toggle('active', mode==='signin');
  document.getElementById('tab-signup').classList.toggle('active', mode==='signup');
  document.getElementById('auth-signup-name').style.display = mode==='signup' ? 'block' : 'none';
  document.getElementById('auth-submit-btn').textContent = mode==='signin' ? 'sign in' : 'create account';
  setAuthMessage('', 'info');
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
  const btn = document.getElementById('forgot-password-btn');
  setAuthMessage('', 'info');
  if (!email) {
    setAuthMessage('Enter your email first, then tap forgot password.');
    return;
  }
  if (!window._authResetPassword) {
    setAuthMessage('App still loading, please wait a moment and try again.');
    return;
  }
  const oldText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'sending...'; }
  try {
    if (window.FIREBASE_CONFIGURED && window._authBackend !== 'firebase' && !window._firebaseInitDone) {
      setAuthMessage('Connecting to Firebase for password reset...', 'info');
      const started = Date.now();
      while (window._authBackend !== 'firebase' && !window._firebaseInitDone && Date.now() - started < 5000) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
    if (window._authBackend !== 'firebase') {
      throw new Error(window.FIREBASE_CONFIGURED
        ? 'Firebase is not available yet. Refresh the page and try again, or check the browser console for blocked Firebase scripts.'
        : 'Password reset is available only when Firebase is configured.');
    }
    await window._authResetPassword(email);
    setAuthMessage('Password reset email sent. Check your inbox.', 'ok');
  } catch(e) {
    const msg = (e.message||'Password reset failed')
      .replace('Firebase: ','')
      .replace(/\(auth\/[^)]+\)/g,'')
      .replace('auth/user-not-found','No account with that email')
      .replace('auth/invalid-email','Enter a valid email')
      .replace('auth/unauthorized-domain','This domain is not authorized in Firebase Authentication settings')
      .trim();
    setAuthMessage(msg || 'Password reset failed. Please try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = oldText || 'forgot password?'; }
  }
}
window.sendPasswordReset = sendPasswordReset;
function bindForgotPasswordButton() {
  const btn = document.getElementById('forgot-password-btn');
  if (btn) btn.addEventListener('click', sendPasswordReset);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindForgotPasswordButton);
else bindForgotPasswordButton();
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
