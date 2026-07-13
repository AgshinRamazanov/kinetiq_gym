(() => {
  const read = (key, fallback) => window.Kinetiq?.storage?.read(key, fallback) ?? fallback;
  const write = (key, value) => window.Kinetiq?.storage?.write(key, value);
  const today = () => new Date().toISOString().slice(0, 10);
  const home = document.getElementById('home');
  const plan = document.getElementById('plan');
  const progress = document.getElementById('progress');
  const nutrition = document.getElementById('nutrition');
  const appLocale = () => window.KinetiqI18n?.currentLanguage?.() || document.documentElement.lang || 'en';

  home.querySelector('.hero-copy').insertAdjacentHTML('beforeend', `
    <button class="readiness-dial" id="readiness-open" type="button" aria-label="Log recovery to calculate readiness"><strong id="readiness-score">—</strong><span><b id="readiness-label">Add check-in</b><small id="readiness-detail">Readiness needs sleep and water</small></span></button>`);
  home.querySelector('.workout-card').insertAdjacentHTML('afterend', `
    <section class="habit-panel"><div class="concept-heading"><div><small>HABIT STREAKS</small><h2>Small wins, stacked.</h2></div><button id="quick-log-open" aria-label="Quick log">+</button></div>
      <div class="habit-row">
        <button data-habit="training"><i>✓</i><b id="habit-training">0</b><span>Training</span></button>
        <button data-habit="nutrition"><i>◒</i><b id="habit-nutrition">0</b><span>Nutrition</span></button>
        <button data-habit="water"><i>◇</i><b id="habit-water">0</b><span>Hydration</span></button>
        <button data-habit="sleep"><i>☾</i><b id="habit-sleep">0</b><span>Sleep</span></button>
      </div>
    </section>
    <div class="daily-focus"><small>FOCUS OF THE DAY</small><p id="daily-focus-copy">Move well. Fuel simply. Recover fully.</p></div>`);

  // Reconstruct Today around the editorial dashboard hierarchy instead of
  // leaving the legacy section order underneath the new visual skin.
  const todayFlow = document.createElement('div');
  todayFlow.className = 'today-flow';
  home.querySelector('.hero-copy').after(todayFlow);
  const homeWorkout = home.querySelector('.workout-card');
  const habitPanel = home.querySelector('.habit-panel');
  const calorieCard = home.querySelector('.calorie-card');
  const scanCard = home.querySelector('.scan-card');
  const dailyFocus = home.querySelector('.daily-focus');
  todayFlow.append(homeWorkout, habitPanel);
  const todayMetrics = document.createElement('section');
  todayMetrics.className = 'today-metrics';
  todayMetrics.innerHTML = `<div class="today-metrics-heading"><small>DAILY BASICS</small><h2>Fuel and recovery</h2></div>`;
  const metricGrid = document.createElement('div');
  metricGrid.className = 'today-metric-grid';
  metricGrid.append(calorieCard);
  metricGrid.insertAdjacentHTML('beforeend', `<button class="hydration-card" id="hydration-card" type="button"><small>HYDRATION</small><strong id="concept-water">1.4<span>L</span></strong><p>of <b id="concept-water-goal">2.5</b>L today</p><i><em></em></i></button>`);
  todayMetrics.append(metricGrid);
  todayFlow.append(todayMetrics, scanCard, dailyFocus);
  document.getElementById('hydration-card').addEventListener('click', () => window.Kinetiq.ui.openSheet('quick-log'));

  plan.querySelector('.page-header').insertAdjacentHTML('afterend', `<div class="concept-calendar" id="concept-calendar"></div>`);
  const calendar = document.getElementById('concept-calendar');
  function renderCalendar() {
    calendar.innerHTML = '';
    const base = new Date();
    for (let offset = -2; offset <= 4; offset += 1) {
      const date = new Date(base); date.setDate(base.getDate() + offset);
      const weekday = new Intl.DateTimeFormat(appLocale(), { weekday: 'short' }).format(date).replace('.', '').slice(0, 3);
      calendar.insertAdjacentHTML('beforeend', `<button type="button" class="${offset === 0 ? 'active' : ''}" aria-label="${date.toLocaleDateString(appLocale())}"><span>${weekday}</span><b>${date.getDate()}</b></button>`);
    }
  }
  renderCalendar();

  // Reconstruct Train as a true program screen: calendar, program identity,
  // split, sessions, recovery, and one clear generation action.
  const planHeading = plan.querySelector('.page-header h1');
  planHeading.textContent = 'Workout Plan';
  planHeading.removeAttribute('data-no-i18n');
  plan.querySelector('.page-header .eyebrow').hidden = true;
  const muscleFigure = zone => `<img class="split-cutout" src="assets/training-split/transparent/${zone}.png" alt="">`;
  calendar.insertAdjacentHTML('afterend', `<section class="program-intro"><h2 id="concept-program-title">Strength Foundation</h2><p>4 weeks · Build base · Improve performance</p></section><section class="training-place"><small>WHERE ARE YOU TRAINING?</small><div><button class="active" data-place="gym"><b>GYM</b><span>Full equipment</span></button><button data-place="home"><b>HOME</b><span>Minimal equipment</span></button></div></section><section class="training-split"><small>YOUR TRAINING SPLIT</small><div><button class="active" data-body="lower">${muscleFigure('lower')}<span>Lower</span></button><button data-body="upper">${muscleFigure('upper')}<span>Upper</span></button><button data-body="push">${muscleFigure('push')}<span>Push</span></button><button data-body="pull">${muscleFigure('pull')}<span>Pull</span></button><button data-body="full">${muscleFigure('full')}<span>Full body</span></button></div></section>`);
  const planSessions = plan.querySelector('.session-list');
  const planBuilder = plan.querySelector('.workout-builder');
  const trainingSplit = plan.querySelector('.training-split');
  trainingSplit.querySelector('[data-body="full"]').insertAdjacentHTML('afterend', `<button data-body="core">${muscleFigure('core')}<span>Core</span></button>`);
  trainingSplit.insertAdjacentHTML('afterend', `<section class="training-count"><small>HOW MANY EXERCISES?</small><div><button data-count="3">3</button><button class="active" data-count="4">4</button><button data-count="5">5</button><button data-count="custom">Custom</button></div><label hidden>Custom amount<input id="custom-exercise-count" type="number" min="3" value="6" inputmode="numeric"><span id="exercise-count-limit"></span></label></section>`);
  const trainingCount = plan.querySelector('.training-count');
  const sessionTitle = [...plan.querySelectorAll('.section-title')].find(item => item.querySelector('h2')?.textContent);
  planSessions.insertAdjacentHTML('afterend', `<article class="recovery-session"><i>♧</i><div><small>ACTIVE RECOVERY</small><strong>Mobility and reset</strong><span>30 min · Easy</span></div><b>→</b></article>`);
  const recoverySession = plan.querySelector('.recovery-session');
  trainingCount.after(sessionTitle, planSessions, recoverySession, planBuilder);
  const sessionImages = [
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=320&q=75',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=320&q=75',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=320&q=75',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=320&q=75'
  ];
  planSessions.querySelectorAll('.session').forEach((session, index) => {
    session.insertAdjacentHTML('afterbegin', `<i class="session-thumb" style="background-image:url('${sessionImages[index]}')"></i>`);
  });
  trainingSplit.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    trainingSplit.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    window.setTrainingBody?.(button.dataset.body);
  }));
  window.setTrainingBody?.('lower');
  const customCountLabel = trainingCount.querySelector('label');
  const customCountInput = trainingCount.querySelector('input');
  const countLimit = trainingCount.querySelector('#exercise-count-limit');
  window.updateTrainingExerciseLimit = () => {
    const limit = window.trainingExerciseLimit?.() || 3;
    customCountInput.max = String(limit);
    if (Number(customCountInput.value) > limit) customCountInput.value = String(limit);
    countLimit.textContent = `Maximum ${limit}`;
    const active = trainingCount.querySelector('button.active');
    const requested = active?.dataset.count === 'custom' ? customCountInput.value : active?.dataset.count;
    window.setTrainingExerciseCount?.(requested || Math.min(4, limit));
  };
  trainingCount.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    trainingCount.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    const custom = button.dataset.count === 'custom';
    customCountLabel.hidden = !custom;
    window.updateTrainingExerciseLimit();
    if (custom) customCountInput.focus();
  }));
  customCountInput.addEventListener('input', () => {
    const limit = window.trainingExerciseLimit?.() || 3;
    const value = Math.max(3, Math.min(limit, Number(customCountInput.value) || 3));
    if (Number(customCountInput.value) > limit) customCountInput.value = String(limit);
    window.setTrainingExerciseCount?.(value);
  });
  window.updateTrainingExerciseLimit();
  const trainingPlaceControl = plan.querySelector('.training-place');
  trainingPlaceControl.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    trainingPlaceControl.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    plan.querySelector(`.location-choice [data-value="${button.dataset.place}"]`)?.click();
  }));
  plan.querySelectorAll('.goal-switch button').forEach(button => button.addEventListener('click', () => {
    const titles = { muscle: 'Strength Foundation', lose: 'Lean Momentum', gain: 'Strong Surplus' };
    document.getElementById('concept-program-title').textContent = titles[button.dataset.goal] || 'Strength Foundation';
  }));
  planBuilder.insertAdjacentHTML('afterend', `<button class="cancel-plan" id="cancel-workout-plan" type="button">Cancel plan</button>`);
  const cancelPlanButton = document.getElementById('cancel-workout-plan');
  function showEmptyWorkoutPlan() {
    window.Kinetiq?.storage?.remove(`form-generated-workout-${today()}`);
    plan.classList.remove('workout-generated');
    document.getElementById('generate-workout').classList.remove('is-ready');
    planSessions.innerHTML = `<div class="empty-workout"><i>＋</i><h3>No session generated yet</h3><p>Choose Gym or Home and a training split, then build today’s session.</p></div>`;
    cancelPlanButton.hidden = true;
  }
  cancelPlanButton.addEventListener('click', showEmptyWorkoutPlan);
  document.getElementById('generate-workout').addEventListener('click', () => { cancelPlanButton.hidden = false; });
  showEmptyWorkoutPlan();

  progress.querySelector('.page-header').insertAdjacentHTML('afterend', `
    <div class="progress-tabs"><button class="active" data-range="7">This week</button><button data-range="28">4 weeks</button><button data-range="84">12 weeks</button><button data-range="all">All time</button></div>`);
  const progressTabs = progress.querySelector('.progress-tabs');
  progressTabs.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    progressTabs.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    window.setProgressRange?.(button.dataset.range);
  }));
  progress.querySelector('.stats-row').insertAdjacentHTML('afterend', `
    <section class="performance-card"><div><small>STRENGTH</small><strong id="strength-improvement">0%</strong><span>completed-set momentum</span></div><i>↗</i></section>
    <section class="consistency-card"><div class="concept-heading"><div><small>CONSISTENCY</small><h2>Last four weeks</h2></div><b id="consistency-total">0 sessions</b></div><div class="consistency-grid" id="consistency-grid"></div></section>
    <section class="photo-progress"><div class="concept-heading"><div><small>PRIVATE · ON THIS DEVICE</small><h2>Progress photos</h2></div></div><div class="photo-pair"><label><input type="file" accept="image/*" data-photo="before"><span id="photo-before">Add before</span></label><label><input type="file" accept="image/*" data-photo="after"><span id="photo-after">Add current</span></label></div><p>Photos stay in this browser unless cloud synchronization is enabled.</p></section>`);
  nutrition.querySelector('.macro-bars').insertAdjacentHTML('afterend', `<section class="nutrition-insight"><i>↗</i><div><small>DAILY INSIGHT</small><p id="nutrition-insight-copy">Log a meal to unlock today’s nutrition insight.</p></div></section>`);
  nutrition.querySelector('.nutrition-summary').insertAdjacentHTML('afterend', `<div class="nutrition-quick-actions"><button id="manual-meal-open" type="button">Manual meal</button><button id="repeat-meal" type="button">Repeat last meal</button></div>`);

  document.querySelector('main').insertAdjacentHTML('beforeend', `<div class="sheet" id="quick-log" aria-hidden="true"><div class="sheet-content compact-sheet quick-log-sheet"><button class="close" data-close aria-label="Close quick log">×</button><p class="eyebrow">QUICK LOG</p><h2>How did today go?</h2><div class="quick-log-grid"><label>Water <span><button type="button" aria-label="Remove 250 millilitres" data-step="water" data-delta="-.25">−</button><strong id="quick-water">0 L</strong><button type="button" aria-label="Add 250 millilitres" data-step="water" data-delta=".25">+</button></span></label><label>Sleep <span><button type="button" aria-label="Remove 30 minutes of sleep" data-step="sleep" data-delta="-.5">−</button><strong id="quick-sleep">0 h</strong><button type="button" aria-label="Add 30 minutes of sleep" data-step="sleep" data-delta=".5">+</button></span></label></div><button class="primary" id="quick-log-save">Save today</button></div></div>
    <div class="sheet" id="manual-meal" aria-hidden="true"><div class="sheet-content form-sheet manual-meal-sheet"><button class="close" data-close aria-label="Close manual meal">×</button><p class="eyebrow">MANUAL MEAL</p><h2>Log what<br><em>you ate.</em></h2><form id="manual-meal-form"><label>Meal name<input name="name" type="text" maxlength="80" placeholder="e.g. Chicken rice bowl" required></label><div class="input-pair"><label>Calories<input name="calories" type="number" min="0" max="5000" required><i>kcal</i></label><label>Protein<input name="protein" type="number" min="0" max="500" value="0"><i>g</i></label></div><div class="input-pair"><label>Carbs<input name="carbs" type="number" min="0" max="800" value="0"><i>g</i></label><label>Fat<input name="fat" type="number" min="0" max="500" value="0"><i>g</i></label></div><button class="primary" type="submit">Add meal</button></form></div></div>`);
  const quickSheet = document.getElementById('quick-log');
  const manualMealSheet = document.getElementById('manual-meal');
  quickSheet.setAttribute('inert','');
  manualMealSheet.setAttribute('inert','');
  document.getElementById('quick-log-open').addEventListener('click', () => window.Kinetiq.ui.openSheet('quick-log'));
  document.getElementById('readiness-open').addEventListener('click', () => window.Kinetiq.ui.openSheet('quick-log'));
  document.getElementById('manual-meal-open').addEventListener('click', () => window.Kinetiq.ui.openSheet('manual-meal'));
  quickSheet.querySelector('[data-close]').addEventListener('click', () => window.Kinetiq.ui.closeSheet(quickSheet));
  manualMealSheet.querySelector('[data-close]').addEventListener('click', () => window.Kinetiq.ui.closeSheet(manualMealSheet));

  let quick = { water: 0, sleep: 0, ...(read('form-wellness-log', {})[today()] || {}) };
  function renderQuick() {
    document.getElementById('quick-water').textContent = `${quick.water.toFixed(2).replace(/0$/,'')} L`;
    document.getElementById('quick-sleep').textContent = `${quick.sleep.toFixed(1).replace('.0','')} h`;
  }
  quickSheet.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.step; quick[key] = Math.max(0, Math.min(key === 'water' ? 8 : 16, quick[key] + Number(button.dataset.delta))); renderQuick();
  }));
  document.getElementById('quick-log-save').addEventListener('click', () => {
    const log = read('form-wellness-log', {}); log[today()] = quick; write('form-wellness-log', log); renderConceptData(); window.Kinetiq.ui.closeSheet(quickSheet); window.homeToast?.('Today’s recovery log saved.');
  });
  document.getElementById('manual-meal-form').addEventListener('submit', event => {
    event.preventDefault();
    const fields = event.currentTarget.elements;
    saveIntakeMeal({ source: 'manual', name: fields.name.value.trim(), calories: Number(fields.calories.value), protein: Number(fields.protein.value), carbs: Number(fields.carbs.value), fat: Number(fields.fat.value) });
    event.currentTarget.reset();
    window.Kinetiq.ui.closeSheet(manualMealSheet);
    window.homeToast?.('Meal added to today.');
  });
  document.getElementById('repeat-meal').addEventListener('click', () => {
    const recent = [];
    for (let offset = 0; offset < 14; offset += 1) {
      const date = new Date(); date.setDate(date.getDate() - offset);
      const intake = read(`form-daily-intake-${window.localDateId?.(date) || date.toISOString().slice(0, 10)}`, null);
      if (intake?.meals?.length) recent.push(...intake.meals.slice().reverse());
      if (recent.length) break;
    }
    const meal = recent[0];
    if (!meal) return window.homeToast?.('Log one meal first, then you can repeat it.');
    saveIntakeMeal({ source: 'repeat', name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat });
    window.homeToast?.(`${meal.name} added again.`);
  });

  function streakFor(predicate) {
    let count = 0; const cursor = new Date();
    while (predicate(cursor)) { count += 1; cursor.setDate(cursor.getDate() - 1); }
    return count;
  }
  function renderConceptData() {
    const wellness = read('form-wellness-log', {});
    const meals = read('form-scanned-meals', []);
    const completions = read('form-exercise-completions', []);
    const dateKey = date => date.toISOString().slice(0,10);
    const trainingDays = new Set(completions.map(item => dateKey(new Date(item.date))));
    const mealDays = new Set(meals.map(item => dateKey(new Date(item.date || item.createdAt || Date.now()))));
    document.getElementById('habit-training').textContent = streakFor(date => trainingDays.has(dateKey(date)));
    document.getElementById('habit-nutrition').textContent = streakFor(date => mealDays.has(dateKey(date)));
    document.getElementById('habit-water').textContent = streakFor(date => (wellness[dateKey(date)]?.water || 0) >= 2);
    document.getElementById('habit-sleep').textContent = streakFor(date => (wellness[dateKey(date)]?.sleep || 0) >= 7);
    const todayWellness = wellness[today()] || {};
    const water = Number(todayWellness.water || 0), sleep = Number(todayWellness.sleep || 0);
    document.getElementById('concept-water').innerHTML = `${water.toFixed(1)}<span>L</span>`;
    const waterGoal = Number(read('form-daily-goals', {})?.water || 2.5);
    document.getElementById('concept-water-goal').textContent = waterGoal;
    document.querySelector('.hydration-card p').innerHTML = `${homeT('of')} <b id="concept-water-goal">${waterGoal}</b>L ${homeT('today')}`;
    document.querySelector('.hydration-card em').style.width = `${Math.min(100, water / waterGoal * 100)}%`;
    const hasReadinessData = sleep > 0 && water > 0;
    const score = hasReadinessData ? Math.round(Math.min(100, 35 + Math.min(35, sleep / 8 * 35) + Math.min(30, water / waterGoal * 30))) : null;
    const dial = document.getElementById('readiness-open');
    dial.style.setProperty('--readiness', score || 0);
    dial.classList.toggle('no-data', !hasReadinessData);
    document.getElementById('readiness-score').textContent = score ?? '—';
    document.getElementById('readiness-label').textContent = score === null ? 'Add check-in' : score >= 80 ? 'High' : score >= 65 ? 'Steady' : 'Recover';
    document.getElementById('readiness-detail').textContent = score === null ? 'Sleep + water needed' : 'Based on today’s sleep and water';
    dial.setAttribute('aria-label', homeT(score === null ? 'Log recovery to calculate readiness' : 'Edit today’s recovery check-in'));
    document.getElementById('daily-focus-copy').textContent = score === null ? 'Log sleep and water to get a useful daily recommendation.' : score >= 80 ? 'You are ready to push. Keep form crisp.' : score >= 65 ? 'Build steadily and leave two reps in reserve.' : 'Choose recovery, mobility, and an early night.';
    const grid = document.getElementById('consistency-grid'); grid.innerHTML = '';
    for (let ago = 27; ago >= 0; ago -= 1) { const day = new Date(); day.setDate(day.getDate()-ago); const done = trainingDays.has(dateKey(day)); grid.insertAdjacentHTML('beforeend', `<i class="${done ? 'done' : ''}" title="${dateKey(day)}"></i>`); }
    const recent = [...trainingDays].filter(key => (Date.now() - new Date(key).getTime()) < 28*86400000).length;
    document.getElementById('consistency-total').innerHTML = `${recent} <span>sessions</span>`;
    const workoutHistory = read('form-workout-history', []);
    const cutoff = Date.now() - 14 * 86400000;
    const hasStrengthBaseline = workoutHistory.some(item => Number(item.date) < Date.now() - 7 * 86400000 && Number(item.date) >= cutoff) && workoutHistory.some(item => Number(item.date) >= Date.now() - 7 * 86400000);
    document.getElementById('strength-improvement').textContent = hasStrengthBaseline ? `${Math.min(99, Math.round(completions.length / Math.max(1, recent) * 3))}%` : '—';
    document.querySelector('.performance-card span').textContent = hasStrengthBaseline ? 'two-week set comparison' : 'Complete sets across two weeks to compare';
    const intake = read(`form-daily-intake-${today()}`, { meals: [], protein: 0 });
    const protein = Number(intake.protein || 0);
    document.getElementById('nutrition-insight-copy').textContent = !intake.meals?.length ? 'Log a meal to unlock today’s nutrition insight.' : protein >= 100 ? 'Protein is on track. Add colour and fibre next.' : 'Build your next meal around a clear protein source.';
    renderHomeAction();
    renderRealNotifications();
  }
  function renderHomeAction() {
    const generated = read(`form-generated-workout-${today()}`, null);
    const completedToday = read('form-exercise-completions', []).filter(item => new Date(item.date).toISOString().slice(0, 10) === today()).length;
    const card = home.querySelector('.workout-card');
    const badge = card.querySelector('.workout-photo span');
    const title = card.querySelector('.workout-info h3');
    const detail = card.querySelector('.workout-info>div b');
    if (!generated) {
      badge.textContent = 'START'; title.innerHTML = 'Build today’s<br>workout'; detail.textContent = 'Choose place and focus';
    } else if (!completedToday) {
      badge.textContent = 'READY'; title.innerHTML = 'Today’s workout<br>is ready'; detail.textContent = `${generated.exerciseCount || 4} exercises`;
    } else {
      badge.textContent = '✓ DONE'; title.innerHTML = 'Training logged.<br>Keep the rhythm.'; detail.textContent = `${completedToday} exercises completed`;
    }
  }
  function renderRealNotifications() {
    const list = document.querySelector('#notifications .notification-list');
    const generated = read(`form-generated-workout-${today()}`, null);
    const intake = read(`form-daily-intake-${today()}`, { meals: [], protein: 0 });
    const proteinGoal = Number(read('form-daily-goals', {})?.protein || 145);
    const items = [];
    if (generated) items.push(['↗', 'Today’s workout is ready', `${generated.exerciseCount || 4} exercises · ${generated.place === 'home' ? 'Home' : 'Gym'}`]);
    if (intake.meals?.length && Number(intake.protein) < proteinGoal) items.push(['◉', 'Protein check', `${Math.max(0, proteinGoal - Number(intake.protein || 0))}g left today`]);
    list.innerHTML = items.length ? items.map(([icon, title, copy]) => `<article class="notification unread"><i>${icon}</i><div><strong>${title}</strong><p>${copy}</p><small>TODAY</small></div></article>`).join('') : '<article class="notification-empty"><strong>You’re all caught up.</strong><p>Useful updates will appear after you log activity.</p></article>';
    document.querySelector('.topbar .icon-button i').style.display = items.length && !read('form-notifications-read', false) ? '' : 'none';
  }
  renderQuick(); renderConceptData();
  addEventListener('localDataChanged', renderConceptData);
  addEventListener('languageChanged', () => { renderCalendar(); renderConceptData(); });

  document.querySelectorAll('[data-photo]').forEach(input => input.addEventListener('change', () => {
    const file = input.files?.[0]; if (!file || file.size > 2_000_000) return window.homeToast?.('Choose a photo under 2 MB.');
    const reader = new FileReader(); reader.onload = () => { const photos = read('form-progress-photos', {}); photos[input.dataset.photo] = reader.result; write('form-progress-photos', photos); renderPhotos(); }; reader.readAsDataURL(file);
  }));
  function renderPhotos() { const photos = read('form-progress-photos', {}); for (const key of ['before','after']) { const target=document.getElementById(`photo-${key}`); target.style.backgroundImage=photos[key]?`url(${photos[key]})`:''; target.textContent=photos[key]?'Change photo':`Add ${key === 'after' ? 'current' : key}`; } }
  renderPhotos();
})();
