const defaultGoals = { calories: 1980, protein: 145, carbs: 210, fat: 66, water: 2.5 };
function localDateId(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear(), month = String(date.getMonth() + 1).padStart(2,'0'), day = String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}
function isToday(value) { const date = new Date(value); return Number.isFinite(date.getTime()) && localDateId(date) === localDateId(); }
function appDateTimeSnapshot(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return { dateId: localDateId(date), timestamp: date.getTime(), hour: date.getHours(), minute: date.getMinutes() };
}
function homeToast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800); }
function homeT(text) { return window.KinetiqI18n?.t(text) || text; }
let appDateTime = appDateTimeSnapshot();
function refreshAppDateTime() {
  const previous = appDateTime;
  appDateTime = appDateTimeSnapshot();
  window.KinetiqDateTime = appDateTime;
  window.dispatchEvent(new CustomEvent('appTimeChanged', { detail: appDateTime }));
  if (previous.dateId !== appDateTime.dateId) window.dispatchEvent(new CustomEvent('appDateChanged', { detail: appDateTime }));
}
window.KinetiqDateTime = appDateTime;
function currentGreetingKey(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return 'Good night,';
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  if (hour < 22) return 'Good evening,';
  return 'Good night,';
}
function renderHomeHero(profile = readLocal('form-profile', null)) {
  const lang = window.KinetiqI18n?.currentLanguage?.() || document.documentElement.lang || 'en';
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat(lang, { weekday: 'long', month: 'short', day: '2-digit' }).format(now);
  const dateEl = document.querySelector('.hero-copy .eyebrow');
  const titleEl = document.querySelector('.hero-copy h1');
  if (dateEl) { dateEl.dataset.noI18n = 'true'; dateEl.textContent = dateLabel.replace(',', ' ·').toLocaleUpperCase(lang); }
  const name = profile?.name?.trim()?.split(/\s+/)[0] || homeT('User');
  if (titleEl) { titleEl.dataset.noI18n = 'true'; titleEl.innerHTML = `${homeT(currentGreetingKey(now))}<br><em>${name}.</em>`; }
}
function renderRhythmAccess(profile = readLocal('form-profile', null)) {
  const hidden = !profile;
  const title = document.getElementById('rhythm-section-title');
  const grid = document.getElementById('rhythm-grid');
  if (title) title.hidden = hidden;
  if (grid) grid.hidden = hidden;
}
function trainingCompletionDateId(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? localDateId(date) : null;
}
function calculateTrainingStreak(completions = readLocal('form-exercise-completions', []), date = new Date()) {
  const entries = Array.isArray(completions) ? completions : [];
  const completionDays = new Set(entries.map(item => trainingCompletionDateId(item.date)).filter(Boolean));
  let cursor = new Date(date);
  cursor.setHours(12, 0, 0, 0);
  if (!completionDays.has(localDateId(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completionDays.has(localDateId(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
function renderTrainingStreak() {
  const streak = calculateTrainingStreak();
  const value = document.getElementById('training-streak');
  const label = document.getElementById('training-streak-label');
  if (value) value.textContent = String(streak);
  if (label) label.textContent = streak === 1 ? 'day' : 'days';
}

let dailyGoals = readLocal('form-daily-goals', defaultGoals);
let homeAccountMode = 'login';
function setAccountMode(mode = 'login') {
  homeAccountMode = mode === 'signup' ? 'signup' : 'login';
  const form = document.getElementById('login-form');
  if (form) form.dataset.accountMode = homeAccountMode;
  renderHomeAccount(readLocal('form-profile', null));
}
window.setAccountMode = setAccountMode;
window.getAccountMode = () => homeAccountMode;
const goalFields = { calories: document.getElementById('goal-calories'), protein: document.getElementById('goal-protein'), carbs: document.getElementById('goal-carbs'), fat: document.getElementById('goal-fat'), water: document.getElementById('goal-water') };
function renderGoals() {
  Object.entries(dailyGoals).forEach(([key, value]) => {
    const label = document.getElementById(`${key}-goal-label`);
    if (label) label.textContent = key === 'calories' ? Number(value).toLocaleString() : value;
  });
  document.querySelector('.ring').style.setProperty('--progress', Math.min(100, Math.round(1420 / dailyGoals.calories * 100)));
}
renderGoals();
renderTrainingStreak();
document.querySelector('[data-open="goals"]').addEventListener('click', () => Object.entries(goalFields).forEach(([key, field]) => field.value = dailyGoals[key]));
document.getElementById('goals-form').addEventListener('submit', event => {
  event.preventDefault();
  const next = Object.fromEntries(Object.entries(goalFields).map(([key, field]) => [key, Number(field.value)]));
  if (next.calories < 800 || next.protein < 20 || next.carbs < 20 || next.fat < 10 || next.water < .5) { homeToast('Please check your goal values.'); return; }
  dailyGoals = next; writeLocal('form-daily-goals', dailyGoals); renderGoals(); window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: dailyGoals }));
  document.getElementById('goals').classList.remove('open'); homeToast('Daily goals saved.');
});

document.getElementById('mark-read').addEventListener('click', () => {
  document.querySelectorAll('.notification.unread').forEach(item => item.classList.remove('unread'));
  document.querySelector('.topbar .icon-button i').style.display = 'none';
  writeLocal('form-notifications-read', true); homeToast('All caught up.');
});
if (readLocal('form-notifications-read', false)) {
  document.querySelectorAll('.notification.unread').forEach(item => item.classList.remove('unread'));
  document.querySelector('.topbar .icon-button i').style.display = 'none';
}

function renderProfile(profile) {
  if (!profile) {
    document.querySelectorAll('.profile-trigger').forEach(avatar => {
      avatar.textContent = 'SK';
      avatar.classList.remove('logged-in');
    });
    renderHomeHero(null);
    renderRhythmAccess(null);
    renderHomeAccount(null);
    return;
  }
  const initials = getInitials(profile.name);
  document.querySelectorAll('.profile-trigger').forEach(avatar => {
    avatar.textContent = initials;
    avatar.classList.add('logged-in');
  });
  renderHomeHero(profile);
  renderRhythmAccess(profile);
  renderHomeAccount(profile);
}
function getInitials(name = '') {
  return name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'ME';
}
function accountSyncLabel() {
  return window.formSupabase ? 'Cloud sync' : 'This device';
}
function renderHomeAccount(profile = readLocal('form-profile', null)) {
  const title = document.getElementById('account-title');
  const subtitle = document.getElementById('account-subtitle');
  const form = document.getElementById('login-form');
  const panel = document.getElementById('login-success');
  if (!title || !subtitle || !form || !panel) return;
  if (!profile) {
    const creating = homeAccountMode === 'signup';
    form.dataset.accountMode = homeAccountMode;
    title.innerHTML = creating ? 'Create<br><em>account.</em>' : 'Welcome<br><em>back.</em>';
    subtitle.textContent = creating ? 'Save your setup and keep progress synced.' : 'Log in to keep your goals and progress synced.';
    form.querySelector('button[type="submit"]').textContent = creating ? 'Create account' : 'Log in';
    form.querySelector('[data-action="create-account"]').textContent = creating ? 'Already have an account? Log in' : 'Create an account';
    form.style.display = 'grid';
    panel.classList.remove('show');
    return;
  }
  homeAccountMode = 'login';
  title.innerHTML = 'Your<br><em>profile.</em>';
  subtitle.textContent = 'Manage your account, goals, and setup from here.';
  form.style.display = 'none';
  panel.classList.add('show');
  document.getElementById('home-profile-badge').textContent = getInitials(profile.name);
  document.getElementById('home-profile-name').textContent = profile.name || 'Your profile';
  document.getElementById('home-profile-email').textContent = profile.email || 'Local profile';
  document.getElementById('home-profile-goal').textContent = (typeof programCopy !== 'undefined' ? programCopy[readLocal('form-training-goal','muscle')]?.label : null) || 'Build muscle';
  document.getElementById('home-profile-calories').textContent = `${Number(dailyGoals.calories).toLocaleString()} kcal`;
  document.getElementById('home-profile-sync').textContent = accountSyncLabel();
}
renderProfile(readLocal('form-profile', null));
setInterval(() => { refreshAppDateTime(); renderHomeHero(readLocal('form-profile', null)); }, 60000);
window.addEventListener('focus', () => { refreshAppDateTime(); renderHomeHero(readLocal('form-profile', null)); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { refreshAppDateTime(); renderHomeHero(readLocal('form-profile', null)); } });
window.addEventListener('languageChanged', () => {
  renderHomeHero(readLocal('form-profile', null));
  renderHomeAccount(readLocal('form-profile', null));
});
document.getElementById('login-form').addEventListener('submit', event => {
  event.preventDefault();
  const profile = { name: document.getElementById('login-name').value.trim(), email: document.getElementById('login-email').value.trim() };
  writeLocal('form-profile', profile); renderProfile(profile);
  homeToast('Profile ready.');
});
document.querySelectorAll('[data-open="login"]').forEach(button => button.addEventListener('click', () => {
  renderHomeAccount(readLocal('form-profile', null));
}));
document.querySelector('[data-action="create-account"]').addEventListener('click', () => {
  setAccountMode(homeAccountMode === 'signup' ? 'login' : 'signup');
});
document.getElementById('home-edit-goals')?.addEventListener('click', () => {
  document.getElementById('login').classList.remove('open');
  document.querySelector('[data-open="goals"]').click();
});
document.getElementById('home-edit-setup')?.addEventListener('click', () => {
  document.getElementById('login').classList.remove('open');
  if (typeof openOnboarding === 'function') openOnboarding(true);
  else {
    document.getElementById('onboarding').classList.add('open');
    document.getElementById('onboarding').setAttribute('aria-hidden','false');
  }
});
document.getElementById('home-logout-button')?.addEventListener('click', async () => {
  if (window.formCloudSignOut) await window.formCloudSignOut();
  localStorage.removeItem('form-profile');
  renderProfile(null);
  if (typeof renderTrainProfile === 'function') renderTrainProfile();
  document.getElementById('login').classList.remove('open');
  homeToast('You’re logged out.');
});
window.addEventListener('goalsUpdated', () => renderHomeAccount());
window.addEventListener('exerciseCompleted', renderTrainingStreak);
window.addEventListener('appDateChanged', renderTrainingStreak);
window.addEventListener('localDataChanged', event => {
  if (event.detail?.key === 'form-exercise-completions') renderTrainingStreak();
});
