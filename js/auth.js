// Auth is intentionally self-contained: local auth is available immediately,
// and Firebase upgrades it when the CDN modules load successfully.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBcJgURkeBthHabtHjq130U9SEeIpR4IU8",
  authDomain: "dig-routine-tracker.firebaseapp.com",
  projectId: "dig-routine-tracker",
  storageBucket: "dig-routine-tracker.firebasestorage.app",
  messagingSenderId: "194398144251",
  appId: "1:194398144251:web:c1a09fdab47d2b6604925e",
};

const FIREBASE_CONFIGURED = !FIREBASE_CONFIG.apiKey.includes('PASTE');
window.FIREBASE_READY = false;
window._authBackend = 'local';

function loadUserState() {
  const uid = window._currentUser?.uid;
  if (!uid) return;
  try {
    const s = localStorage.getItem('rtV3_' + uid);
    if (s) {
      const p = JSON.parse(s);
      state.items       = p.items       || [];
      state.completions = p.completions || {};
      state.workLogs    = p.workLogs    || {};
      state.mealLogs    = p.mealLogs    || {};
      state.exerciseLogs = p.exerciseLogs || {};
      state.bodyMetrics = p.bodyMetrics || [];
      state.waterLog    = p.waterLog    || {};
    }
  } catch(e) {}
}

function showAuthScreen() {
  const el = document.getElementById('auth-screen');
  if (el) el.style.display = 'flex';
  const btn = document.getElementById('auth-submit-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'sign in'; }
  const err = document.getElementById('auth-error'); if (err) err.textContent = '';
  const emailEl = document.getElementById('auth-email'); if (emailEl) emailEl.value = '';
  const passEl  = document.getElementById('auth-pass');  if (passEl)  passEl.value  = '';
  const si = document.getElementById('tab-signin'), su = document.getElementById('tab-signup');
  if (si) { si.classList.add('active'); si.style.background = 'var(--teal)'; si.style.color = '#fff'; }
  if (su) { su.classList.remove('active'); su.style.background = 'transparent'; su.style.color = 'var(--txt2)'; }
  const nr = document.getElementById('auth-signup-name'); if (nr) nr.style.display = 'none';
  const note = document.getElementById('auth-offline-note');
  if (note) note.textContent = window.FIREBASE_READY ? '' : 'Offline mode: accounts stored on this device only.';
}

function hideAuthScreen() {
  const el = document.getElementById('auth-screen');
  if (el) el.style.display = 'none';
  loadUserState();
  renderCurrentOrBoot();
  updateUserBadge();
}

function installLocalAuth() {
  window._saveToFirebase = () => {};

  window._authSignUp = async (email, pass, name) => {
    const profiles = JSON.parse(localStorage.getItem('rt_profiles') || '[]');
    if (profiles.find(p => p.email === email)) throw new Error('Email already registered');
    const uid = 'local_' + Date.now();
    profiles.push({ uid, email, name, pass });
    localStorage.setItem('rt_profiles', JSON.stringify(profiles));
    window._currentUser = { uid, email, name };
    localStorage.setItem('rt_activeUser', JSON.stringify(window._currentUser));
    hideAuthScreen();
  };

  window._authSignIn = async (email, pass) => {
    const profiles = JSON.parse(localStorage.getItem('rt_profiles') || '[]');
    const p = profiles.find(p => p.email === email && p.pass === pass);
    if (!p) throw new Error('Invalid email or password');
    window._currentUser = { uid: p.uid, email: p.email, name: p.name };
    localStorage.setItem('rt_activeUser', JSON.stringify(window._currentUser));
    hideAuthScreen();
  };

  window._authSignOut = () => {
    window._currentUser = null;
    localStorage.removeItem('rt_activeUser');
    state.items = []; state.completions = {}; state.workLogs = {};
    state.mealLogs = {}; state.exerciseLogs = {}; state.bodyMetrics = []; state.waterLog = {};
    showAuthScreen();
    updateUserBadge();
  };
}

async function installFirebaseAuth() {
  if (!FIREBASE_CONFIGURED) return;

  const [appMod, firestoreMod, authMod] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
  ]);

  const app = appMod.initializeApp(FIREBASE_CONFIG);
  const db = firestoreMod.getFirestore(app);
  const auth = authMod.getAuth(app);
  let unsub = null;

  window.FIREBASE_READY = true;
  window._authBackend = 'firebase';
  setSyncDot('live');

  authMod.onAuthStateChanged(auth, user => {
    if (user) {
      window._currentUser = { uid: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0] };
      localStorage.setItem('rt_activeUser', JSON.stringify(window._currentUser));
      if (unsub) unsub();
      const ref = firestoreMod.doc(db, 'users', user.uid, 'data', 'main');
      unsub = firestoreMod.onSnapshot(ref, snap => {
        if (snap.exists()) {
          const r = snap.data();
          state.items       = r.items       || state.items;
          state.completions = r.completions || state.completions;
          state.workLogs    = r.workLogs    || state.workLogs;
          state.mealLogs    = r.mealLogs    || state.mealLogs;
          state.exerciseLogs = r.exerciseLogs || state.exerciseLogs;
          state.bodyMetrics = r.bodyMetrics || state.bodyMetrics;
          state.waterLog    = r.waterLog    || state.waterLog;
          renderCurrent();
        }
      });
      hideAuthScreen();
    } else {
      window._currentUser = null;
      localStorage.removeItem('rt_activeUser');
      if (unsub) { unsub(); unsub = null; }
      showAuthScreen();
      updateUserBadge();
    }
  });

  window._saveToFirebase = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const ref = firestoreMod.doc(db, 'users', user.uid, 'data', 'main');
      await firestoreMod.setDoc(ref, {
        items: state.items, completions: state.completions,
        workLogs: state.workLogs, mealLogs: state.mealLogs, exerciseLogs: state.exerciseLogs,
        bodyMetrics: state.bodyMetrics, waterLog: state.waterLog,
        updatedAt: Date.now()
      });
    } catch(e) { console.warn('Firebase save failed', e); }
  };

  window._authSignUp = async (email, pass, name) => {
    const cred = await authMod.createUserWithEmailAndPassword(auth, email, pass);
    await authMod.updateProfile(cred.user, { displayName: name });
  };
  window._authSignIn = (email, pass) => authMod.signInWithEmailAndPassword(auth, email, pass);
  window._authSignOut = () => { if (unsub) { unsub(); unsub = null; } authMod.signOut(auth); };
}

function restoreLocalSession() {
  setTimeout(() => {
    if (window._currentUser || window.FIREBASE_READY) return;
    const active = localStorage.getItem('rt_activeUser');
    if (active) {
      window._currentUser = JSON.parse(active);
      hideAuthScreen();
    } else {
      showAuthScreen();
      updateUserBadge();
    }
  }, 100);
}

window.showAuthScreen = showAuthScreen;
window.hideAuthScreen = hideAuthScreen;

installLocalAuth();
restoreLocalSession();
installFirebaseAuth().catch(e => {
  console.warn('Firebase unavailable; using local auth', e);
  window.FIREBASE_READY = false;
  window._authBackend = 'local';
  setSyncDot('off');
  const note = document.getElementById('auth-offline-note');
  if (note) note.textContent = 'Offline mode: accounts stored on this device only.';
});
