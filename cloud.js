const config = window.SUPABASE_CONFIG || {};
const loginForm = document.getElementById('login-form');
const loginButton = loginForm.querySelector('button[type="submit"]');
const createButton = loginForm.querySelector('[data-action="create-account"]');
const status = document.createElement('p');
status.className = 'cloud-status';
loginForm.appendChild(status);

let accountMode = window.getAccountMode?.() || 'login';
let supabase = null;
let currentUser = null;
let hydrating = false;
let flushing = false;
const queue = window.Kinetiq?.syncQueue;
const META_KEY = 'kinetiq-sync-meta';
const CONFLICT_KEY = 'kinetiq-sync-conflicts';
const DEVICE_KEY = 'kinetiq-device-id';
const PENDING_VERIFICATION_KEY = 'kinetiq-pending-verification';
const TERMS_VERSION = '2026-07-12';
const resendVerificationButton = document.getElementById('resend-verification');
const deviceId = localStorage.getItem(DEVICE_KEY) || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
localStorage.setItem(DEVICE_KEY, deviceId);
window.getCloudAccessToken = async () => (await supabase?.auth.getSession())?.data?.session?.access_token || null;

function setStatus(message, tone = '') {
  status.textContent = message;
  status.className = `cloud-status ${tone}`.trim();
}
function configured() {
  return /^https:\/\/.+\.supabase\.co$/.test(config.url || '') && Boolean(config.anonKey);
}
function authRedirectUrl() {
  const configuredRedirect = String(config.redirectUrl || '').trim();
  return configuredRedirect || new URL(location.pathname, location.origin).href;
}
function pendingVerification() {
  try { return JSON.parse(localStorage.getItem(PENDING_VERIFICATION_KEY)); } catch { return null; }
}
function showPendingVerification(email) {
  resendVerificationButton.hidden = false;
  document.getElementById('login-email').value = email || '';
  setStatus(`Account created for ${email}. Open the verification email to activate it, then return here.`, 'online');
}
function clearPendingVerification() {
  localStorage.removeItem(PENDING_VERIFICATION_KEY);
  resendVerificationButton.hidden = true;
}
async function ensureCurrentTerms(user) {
  if (!user || user.user_metadata?.terms_version === TERMS_VERSION) return true;
  const accepted = confirm('KINETIQ updated its Terms, Privacy Policy, and health disclaimer. Accept them to continue cloud synchronization?');
  if (!accepted) {
    await supabase.auth.signOut();
    setStatus('Terms were not accepted. Cloud synchronization is signed out.', 'error');
    return false;
  }
  const { data, error } = await supabase.auth.updateUser({ data: { terms_version: TERMS_VERSION, consented_at: new Date().toISOString() } });
  if (error) throw error;
  currentUser = data.user;
  return true;
}
function callbackError() {
  const params = new URLSearchParams(`${location.search.slice(1)}&${location.hash.slice(1)}`);
  const description = params.get('error_description');
  if (!description) return null;
  history.replaceState({}, document.title, location.pathname);
  return description.replaceAll('+', ' ');
}
function readMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch { return {}; }
}
function writeMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}
function rememberVersion(row) {
  const meta = readMeta();
  meta[row.key] = { revision: Number(row.revision) || 1, updatedAt: row.updated_at, deviceId: row.device_id };
  writeMeta(meta);
}
function localRows(userId) {
  const rows = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith('form-')) continue;
    try { rows.push({ user_id: userId, key, value: JSON.parse(localStorage.getItem(key)) }); } catch { /* ignore malformed legacy data */ }
  }
  return rows;
}
function clearLocalAccountData() {
  [...Array(localStorage.length)].map((_, index) => localStorage.key(index)).filter(key => key?.startsWith('form-')).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(META_KEY);
  localStorage.removeItem(CONFLICT_KEY);
  sessionStorage.removeItem('form-cloud-hydrated');
}
function saveConflict(change, remote) {
  let conflicts = [];
  try { conflicts = JSON.parse(localStorage.getItem(CONFLICT_KEY)) || []; } catch { /* use empty list */ }
  conflicts.push({ key: change.key, localValue: change.value, remoteValue: remote.value, detectedAt: new Date().toISOString() });
  localStorage.setItem(CONFLICT_KEY, JSON.stringify(conflicts.slice(-20)));
}

async function applyRemote(row) {
  hydrating = true;
  if (row.deleted) localStorage.removeItem(row.key);
  else localStorage.setItem(row.key, JSON.stringify(row.value));
  rememberVersion(row);
  hydrating = false;
}

async function pushChange(change) {
  const baseRevision = Number(readMeta()[change.key]?.revision) || 0;
  const payload = {
    user_id: currentUser.id,
    key: change.key,
    value: change.value,
    deleted: Boolean(change.deleted),
    device_id: deviceId,
    revision: baseRevision + 1,
    updated_at: new Date(change.changedAt).toISOString()
  };
  let result;
  if (baseRevision === 0) {
    result = await supabase.from('user_data').insert(payload).select().maybeSingle();
    if (result.error?.code !== '23505') {
      if (result.error) throw result.error;
      rememberVersion(result.data);
      return true;
    }
  } else {
    result = await supabase.from('user_data').update(payload).eq('user_id', currentUser.id).eq('key', change.key).eq('revision', baseRevision).select().maybeSingle();
    if (result.error) throw result.error;
    if (result.data) {
      rememberVersion(result.data);
      return true;
    }
  }
  const remote = await supabase.from('user_data').select('*').eq('key', change.key).maybeSingle();
  if (remote.error) throw remote.error;
  if (remote.data) {
    saveConflict(change, remote.data);
    await applyRemote(remote.data);
    window.dispatchEvent(new CustomEvent('cloudConflict', { detail: { key: change.key } }));
    setStatus('A newer cloud change was kept; local copy saved for review.', 'error');
  }
  return true;
}

async function flushQueue() {
  if (flushing || !queue || !supabase || !currentUser || !navigator.onLine) return;
  flushing = true;
  try {
    for (const change of await queue.all()) {
      await pushChange(change);
      await queue.remove(change.key);
    }
    setStatus('Synced securely', 'online');
  } catch {
    setStatus('Saved offline · cloud retry pending', 'error');
  } finally {
    flushing = false;
  }
}

async function queueChange(key, value, deleted = false) {
  if (hydrating || !key?.startsWith('form-') || !queue) return;
  await queue.put({ key, value, deleted, changedAt: Date.now(), deviceId });
  await flushQueue();
}

async function hydrateOrMigrate() {
  const response = await supabase.from('user_data').select('*');
  if (response.error) throw response.error;
  if (response.data?.length) {
    const remoteKeys = new Set();
    for (const row of response.data) { remoteKeys.add(row.key); await applyRemote(row); }
    for (const row of localRows(currentUser.id)) {
      if (!remoteKeys.has(row.key)) await queueChange(row.key, row.value);
    }
  } else {
    for (const row of localRows(currentUser.id)) await queueChange(row.key, row.value);
  }
  sessionStorage.setItem('form-cloud-hydrated', '1');
  await flushQueue();
  setStatus('Cloud sync is active.', 'online');
}

function setCloudAccountMode(mode = 'login') {
  accountMode = mode === 'signup' ? 'signup' : 'login';
  loginForm.dataset.accountMode = accountMode;
  loginButton.textContent = accountMode === 'signup' ? 'Create account' : 'Log in';
  createButton.textContent = accountMode === 'signup' ? 'Already have an account? Log in' : 'Create an account';
  setStatus(accountMode === 'signup' ? 'Create a secure account to synchronize your data.' : 'Welcome back.');
  window.setAccountMode?.(accountMode);
  window.setLegalSignupMode?.(accountMode === 'signup');
}

async function signOutEverywhere() {
  if (supabase && currentUser) await supabase.auth.signOut();
  currentUser = null;
  sessionStorage.removeItem('form-cloud-hydrated');
  localStorage.removeItem('form-profile');
  if (typeof renderProfile === 'function') renderProfile(null);
  if (typeof renderTrainProfile === 'function') renderTrainProfile();
}
window.formCloudSignOut = signOutEverywhere;

if (!configured()) {
  setStatus('Cloud setup is ready · add your Supabase project details.');
} else {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    window.formSupabase = supabase;
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;
    if (currentUser && await ensureCurrentTerms(currentUser) && !sessionStorage.getItem('form-cloud-hydrated')) await hydrateOrMigrate();
    supabase.auth.onAuthStateChange(async (event, sessionNow) => {
      currentUser = sessionNow?.user || null;
      if (event === 'PASSWORD_RECOVERY') window.Kinetiq.ui.openSheet('password-reset');
      if (event === 'SIGNED_IN' && currentUser?.email_confirmed_at && pendingVerification()) {
        clearPendingVerification();
        setStatus('Email verified. Your account is active and syncing.', 'online');
        window.Kinetiq.ui.openSheet('login');
        if (typeof homeToast === 'function') homeToast('Email verified · account ready.');
      }
      if (currentUser && event === 'SIGNED_IN' && await ensureCurrentTerms(currentUser) && !sessionStorage.getItem('form-cloud-hydrated')) await hydrateOrMigrate();
    });
    window.addEventListener('localDataChanged', event => queueChange(event.detail.key, event.detail.value, event.detail.value === null));
    window.addEventListener('online', flushQueue);
  } catch {
    setStatus('Cloud connection could not start.', 'error');
  }
}

createButton.addEventListener('click', event => {
  if (!configured()) return;
  event.stopImmediatePropagation();
  setCloudAccountMode(accountMode === 'login' ? 'signup' : 'login');
}, true);

loginForm.addEventListener('submit', async event => {
  if (!configured()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  accountMode = (loginForm.dataset.accountMode || accountMode) === 'signup' ? 'signup' : 'login';
  const name = document.getElementById('login-name').value.trim();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  loginButton.disabled = true;
  try {
    const response = accountMode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { data: { name, terms_version: TERMS_VERSION, consented_at: new Date().toISOString() }, emailRedirectTo: authRedirectUrl() } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (response.error) throw response.error;
    if (!response.data.session) {
      localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify({ email, createdAt: Date.now() }));
      showPendingVerification(email);
      if (typeof homeToast === 'function') homeToast('Account created · verify your email.');
      return;
    }
    currentUser = response.data.user;
    const profile = { name: name || currentUser.user_metadata?.name || email.split('@')[0], email, emailVerified: Boolean(currentUser.email_confirmed_at) };
    localStorage.setItem('form-profile', JSON.stringify(profile));
    await hydrateOrMigrate();
    renderProfile(profile);
    if (typeof renderHomeAccount === 'function') renderHomeAccount(profile);
  } catch (error) {
    setStatus(String(error.message || 'Authentication failed.'), 'error');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = accountMode === 'signup' ? 'Create account' : 'Log in';
  }
}, true);

document.getElementById('forgot-password').addEventListener('click', async () => {
  if (!supabase) return setStatus('Cloud account service is not configured.', 'error');
  const email = document.getElementById('login-email').value.trim();
  if (!email) return setStatus('Enter your email first.', 'error');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl() });
  setStatus(error ? error.message : 'Password reset link sent. Check your email.', error ? 'error' : 'online');
});

resendVerificationButton.addEventListener('click', async () => {
  if (!supabase) return setStatus('Cloud account service is not configured.', 'error');
  const email = pendingVerification()?.email || document.getElementById('login-email').value.trim();
  if (!email) return setStatus('Enter your email first.', 'error');
  resendVerificationButton.disabled = true;
  const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: authRedirectUrl() } });
  setStatus(error ? error.message : 'A new verification email was sent.', error ? 'error' : 'online');
  resendVerificationButton.disabled = false;
});

const verificationError = callbackError();
if (verificationError) {
  setStatus(`Verification failed: ${verificationError}. Request a new email below.`, 'error');
  resendVerificationButton.hidden = false;
  window.Kinetiq.ui.openSheet('login');
} else if (pendingVerification() && !currentUser) {
  showPendingVerification(pendingVerification().email);
}

document.getElementById('password-reset-form').addEventListener('submit', async event => {
  event.preventDefault();
  const output = document.getElementById('password-reset-status');
  if (!supabase) {
    output.textContent = 'Cloud account service is not configured.';
    output.className = 'cloud-status error';
    return;
  }
  const password = document.getElementById('new-password').value;
  const { error } = await supabase.auth.updateUser({ password });
  output.textContent = error ? error.message : 'Password updated. You can continue securely.';
  output.className = `cloud-status ${error ? 'error' : 'online'}`;
  if (!error) setTimeout(() => window.Kinetiq.ui.closeSheet(document.getElementById('password-reset')), 900);
});

document.getElementById('delete-account').addEventListener('click', async () => {
  if (!supabase || !currentUser || !confirm('Permanently delete your account, workouts, meals, and progress? This cannot be undone.')) return;
  const { error } = await supabase.rpc('delete_own_account');
  if (error) return setStatus(error.message, 'error');
  clearLocalAccountData();
  currentUser = null;
  await supabase.auth.signOut({ scope: 'local' });
  location.reload();
});

document.getElementById('logout-button').addEventListener('click', async event => {
  if (!supabase || !currentUser) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  await signOutEverywhere();
  window.Kinetiq.ui.closeSheet(document.getElementById('train-profile'));
  homeToast('Logged out from cloud account.');
}, true);
