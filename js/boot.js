// ── Boot: apply theme first, then let auth handle rendering ──
const _bootSettings = getSettings();
applyTheme(_bootSettings.theme);
// Auth module handles calling renderCurrentOrBoot() after sign-in
// For offline mode without Firebase, auto-check happens in the module timeout
// If no Firebase and no active user found within 250ms, show auth
setTimeout(() => {
  if(!window._currentUser) {
    if (typeof showAuthScreen === 'function') {
      showAuthScreen();
      const noteEl = document.getElementById('auth-offline-note');
      if(noteEl && !window.FIREBASE_READY) noteEl.textContent = '⚠ Offline mode: accounts stored on this device only.';
    } else {
      // Auth module failed to load (network/ad-blocker/CDN issue) — fall back to a guest session so the app is never blank
      console.warn('Auth module unavailable — falling back to guest mode');
      window._currentUser = { uid: 'guest', email: 'guest@local', name: 'Guest' };
      renderCurrentOrBoot();
      const badge = document.getElementById('user-badge');
      if (badge) badge.style.display = 'none';
    }
  }
}, 250);
// Absolute final safety net: keep auth visible when auth is available; only use guest if auth failed to load.
setTimeout(() => {
  const hero = document.getElementById('hero-card');
  if (hero && !hero.innerHTML.trim()) {
    if (typeof showAuthScreen === 'function') {
      showAuthScreen();
      updateUserBadge();
    } else {
      console.warn('Auth module unavailable — falling back to guest mode');
      window._currentUser = { uid: 'guest', email: 'guest@local', name: 'Guest' };
      renderCurrentOrBoot();
      updateUserBadge();
    }
  }
}, 2000);
if('Notification' in window&&Notification.permission==='default') Notification.requestPermission();
setInterval(checkReminders,60000);


// ── Service Worker (PWA offline support) ──────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ── Install prompt (Android Chrome "Add to Home Screen") ──────────
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  const btn = document.getElementById('install-app-btn');
  if (btn) btn.style.display = 'flex';
});
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('install-app-btn');
  if (btn) btn.style.display = 'none';
  _installPrompt = null;
});
function installApp() {
  if (_installPrompt) {
    _installPrompt.prompt();
    _installPrompt.userChoice.then(() => { _installPrompt = null; });
  }
}
