const defaultGoals = { calories: 1980, protein: 145, carbs: 210, fat: 66, water: 2.5 };
function localDateId(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear(), month = String(date.getMonth() + 1).padStart(2,'0'), day = String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}
function isToday(value) { const date = new Date(value); return Number.isFinite(date.getTime()) && localDateId(date) === localDateId(); }
function readLocal(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function writeLocal(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new CustomEvent('localDataChanged',{detail:{key,value}})); } catch {} }
function homeToast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800); }

let dailyGoals = readLocal('form-daily-goals', defaultGoals);
let homeAccountMode = 'login';
function setAccountMode(mode = 'login') {
  homeAccountMode = mode === 'signup' ? 'signup' : 'login';
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
    document.querySelector('.hero-copy h1').innerHTML = 'Good morning,<br><em>Senan.</em>';
    renderHomeAccount(null);
    return;
  }
  const initials = getInitials(profile.name);
  document.querySelectorAll('.profile-trigger').forEach(avatar => {
    avatar.textContent = initials;
    avatar.classList.add('logged-in');
  });
  document.querySelector('.hero-copy h1').innerHTML = `Good morning,<br><em>${profile.name.split(' ')[0]}.</em>`;
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
