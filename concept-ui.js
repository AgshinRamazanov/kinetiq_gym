(() => {
  const read = (key, fallback) => window.Kinetiq?.storage?.read(key, fallback) ?? fallback;
  const write = (key, value) => window.Kinetiq?.storage?.write(key, value);
  const today = () => new Date().toISOString().slice(0, 10);
  const home = document.getElementById('home');
  const plan = document.getElementById('plan');
  const progress = document.getElementById('progress');
  const nutrition = document.getElementById('nutrition');

  home.querySelector('.hero-copy').insertAdjacentHTML('beforeend', `
    <div class="readiness-dial"><strong id="readiness-score">82</strong><span>Readiness<br><b>High</b></span></div>`);
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
  const base = new Date();
  for (let offset = -2; offset <= 4; offset += 1) {
    const date = new Date(base); date.setDate(base.getDate() + offset);
    calendar.insertAdjacentHTML('beforeend', `<button class="${offset === 0 ? 'active' : ''}"><span>${date.toLocaleDateString(undefined,{weekday:'short'}).slice(0,3)}</span><b>${date.getDate()}</b></button>`);
  }

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
  const sessionTitle = [...plan.querySelectorAll('.section-title')].find(item => item.querySelector('h2')?.textContent);
  planSessions.insertAdjacentHTML('afterend', `<article class="recovery-session"><i>♧</i><div><small>ACTIVE RECOVERY</small><strong>Mobility and reset</strong><span>30 min · Easy</span></div><b>→</b></article>`);
  const recoverySession = plan.querySelector('.recovery-session');
  trainingSplit.after(sessionTitle, planSessions, recoverySession, planBuilder);
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
  nutrition.querySelector('.macro-bars').insertAdjacentHTML('afterend', `<section class="nutrition-insight"><i>↗</i><div><small>DAILY INSIGHT</small><p id="nutrition-insight-copy">Build each meal around a clear protein source.</p></div></section>`);

  document.querySelector('main').insertAdjacentHTML('beforeend', `<div class="sheet" id="quick-log" aria-hidden="true"><div class="sheet-content compact-sheet quick-log-sheet"><button class="close" data-close aria-label="Close quick log">×</button><p class="eyebrow">QUICK LOG</p><h2>How did today go?</h2><div class="quick-log-grid"><label>Water <span><button data-step="water" data-delta="-.25">−</button><strong id="quick-water">0 L</strong><button data-step="water" data-delta=".25">+</button></span></label><label>Sleep <span><button data-step="sleep" data-delta="-.5">−</button><strong id="quick-sleep">0 h</strong><button data-step="sleep" data-delta=".5">+</button></span></label></div><button class="primary" id="quick-log-save">Save today</button></div></div>`);
  const quickSheet = document.getElementById('quick-log');
  quickSheet.setAttribute('inert','');
  document.getElementById('quick-log-open').addEventListener('click', () => window.Kinetiq.ui.openSheet('quick-log'));
  quickSheet.querySelector('[data-close]').addEventListener('click', () => window.Kinetiq.ui.closeSheet(quickSheet));

  let quick = read('form-wellness-log', {})[today()] || { water: 0, sleep: 0 };
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
    document.getElementById('concept-water').innerHTML = `${Number(wellness[today()]?.water || 1.4).toFixed(1)}<span>L</span>`;
    document.getElementById('concept-water-goal').textContent = document.getElementById('water-goal-label')?.textContent || '2.5';
    const score = Math.round(55 + Math.min(20, (wellness[today()]?.sleep || 0) * 2) + Math.min(15, (wellness[today()]?.water || 0) * 5));
    document.getElementById('readiness-score').textContent = score;
    document.getElementById('daily-focus-copy').textContent = score > 80 ? 'You are ready to push. Keep form crisp.' : score > 65 ? 'Build steadily and leave two reps in reserve.' : 'Choose recovery, mobility, and an early night.';
    const grid = document.getElementById('consistency-grid'); grid.innerHTML = '';
    for (let ago = 27; ago >= 0; ago -= 1) { const day = new Date(); day.setDate(day.getDate()-ago); const done = trainingDays.has(dateKey(day)); grid.insertAdjacentHTML('beforeend', `<i class="${done ? 'done' : ''}" title="${dateKey(day)}"></i>`); }
    const recent = [...trainingDays].filter(key => (Date.now() - new Date(key).getTime()) < 28*86400000).length;
    document.getElementById('consistency-total').innerHTML = `${recent} <span>sessions</span>`;
    document.getElementById('strength-improvement').textContent = `${Math.min(99, completions.length * 2)}%`;
    const protein = meals.reduce((sum, item) => sum + Number(item.protein || 0), 0);
    document.getElementById('nutrition-insight-copy').textContent = protein >= 100 ? 'Protein is on track. Add colour and fibre next.' : 'Build your next meal around a clear protein source.';
  }
  renderQuick(); renderConceptData();
  addEventListener('localDataChanged', renderConceptData);

  document.querySelectorAll('[data-photo]').forEach(input => input.addEventListener('change', () => {
    const file = input.files?.[0]; if (!file || file.size > 2_000_000) return window.homeToast?.('Choose a photo under 2 MB.');
    const reader = new FileReader(); reader.onload = () => { const photos = read('form-progress-photos', {}); photos[input.dataset.photo] = reader.result; write('form-progress-photos', photos); renderPhotos(); }; reader.readAsDataURL(file);
  }));
  function renderPhotos() { const photos = read('form-progress-photos', {}); for (const key of ['before','after']) { const target=document.getElementById(`photo-${key}`); target.style.backgroundImage=photos[key]?`url(${photos[key]})`:''; target.textContent=photos[key]?'Change photo':`Add ${key === 'after' ? 'current' : key}`; } }
  renderPhotos();
})();
