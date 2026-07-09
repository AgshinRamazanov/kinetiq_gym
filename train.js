const programCopy = {
  muscle: { title: 'Forge<br>Foundation', subtitle: 'Progressive strength · 4 days/week', label: 'Build muscle' },
  lose: { title: 'Lean<br>Momentum', subtitle: 'Strength circuits · 5 days/week', label: 'Lose fat' },
  gain: { title: 'Mass<br>Method', subtitle: 'Hypertrophy & recovery · 4 days/week', label: 'Gain weight' }
};
let trainingGoal = readLocal('form-training-goal', 'muscle');
let trainingPlace = 'gym';
let trainingBody = 'upper';

function todayWorkoutKey(date = new Date()) {
  return `form-generated-workout-${localDateId(date)}`;
}
function todayWorkoutGenerated() {
  return Boolean(readLocal(todayWorkoutKey(), null));
}
function markTodayWorkoutGenerated() {
  writeLocal(todayWorkoutKey(), { generatedAt: Date.now(), place: trainingPlace, body: trainingBody, goal: trainingGoal });
}
function pulseGenerateWorkout() {
  const button = document.getElementById('generate-workout');
  if (!button) return;
  button.classList.remove('needs-generation');
  void button.offsetWidth;
  button.classList.add('needs-generation');
  button.focus({ preventScroll: true });
}
function setTrainPlanReadyState() {
  const generated = todayWorkoutGenerated();
  document.getElementById('plan')?.classList.toggle('workout-generated', generated);
  document.getElementById('generate-workout')?.classList.toggle('is-ready', generated);
}
function requireTodayWorkoutGenerated() {
  if (todayWorkoutGenerated()) return true;
  pulseGenerateWorkout();
  homeToast('Generate today\'s workout first.');
  return false;
}

const exercises = {
  gym: {
    upper: ['Barbell Bench Press', 'Dumbbell Palm Rotational Bent Over Row', 'Seated Dumbbell Shoulder Press', 'Pull-Up / Chin-Up'],
    lower: ['Barbell Back Squat', 'Dumbbell Deadlift', 'Lever Horizontal Leg Press', 'Treadmill Running'],
    full: ['Barbell Back Squat', 'Barbell Bench Press', 'Dumbbell Palm Rotational Bent Over Row', 'Dumbbell Deadlift'],
    core: ['Cable Kneeling Crunch', 'Hanging Straight Leg Raise', 'Lever Seated Crunch', 'Vertical Leg Raise', 'Bicycle Twisting Crunch']
  },
  home: {
    upper: ['Push-Up', 'Close-Grip Push-Up', 'Incline Push-Up', 'Bench Dips'],
    lower: ['Squat', 'Jump Step-Up', 'Donkey Calf Raise', 'Burpee'],
    full: ['Burpee', 'Squat', 'Push-Up', 'Jumping Jack', 'V-Up'],
    core: ['Side Plank', 'Lying Leg Raise', 'Sit-Up', 'V-Up', 'Twisting Crunch']
  }
};

// Only pairs whose source page explicitly identifies the demonstrated movement.
// Everything else is intentionally withheld instead of showing misleading footage.
const verifiedExerciseVideos = {
  'Dumbbell bench press': ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Video%20showing%20how%20to%20perform%20the%20dumbbell%20bench%20press%20and%20the%20dumbbell%20incline%20bench%20press.webm','https://commons.wikimedia.org/wiki/File:Video_showing_how_to_perform_the_dumbbell_bench_press_and_the_dumbbell_incline_bench_press.webm','Wikimedia Commons'],
  'Bent-over row': ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Bent-over%20row%20-%20exercise%20demonstration%20video.webm','https://commons.wikimedia.org/wiki/File:Bent-over_row_-_exercise_demonstration_video.webm','Wikimedia Commons'],
  'Shoulder press': ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Shoulder%20press%20-%20exercise%20demonstration%20video.webm','https://commons.wikimedia.org/wiki/File:Shoulder_press_-_exercise_demonstration_video.webm','Wikimedia Commons'],
  'Pull-ups': ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Pull-ups%20-%20exercise%20demonstration%20video.webm','https://commons.wikimedia.org/wiki/File:Pull-ups_-_exercise_demonstration_video.webm','Wikimedia Commons'],
  'Deadlift': ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Deadlift%20-%20exercise%20demonstration%20video.webm','https://commons.wikimedia.org/wiki/File:Deadlift_-_exercise_demonstration_video.webm','Wikimedia Commons'],
  'Leg press': ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Hip%20Sled%20-%20How%20to%20perform%20a%2045%20degree%20leg%20press.webm','https://commons.wikimedia.org/wiki/File:Hip_Sled_-_How_to_perform_a_45_degree_leg_press.webm','Wikimedia Commons'],
  'Hanging crunches': ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Hanging%20crunches%20-%20exercise%20demonstration%20video.webm','https://commons.wikimedia.org/wiki/File:Hanging_crunches_-_exercise_demonstration_video.webm','Wikimedia Commons'],
  'Leg raises': ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Leg%20raises%20-%20exercise%20demonstration%20video.webm','https://commons.wikimedia.org/wiki/File:Leg_raises_-_exercise_demonstration_video.webm','Wikimedia Commons'],
  'Gym push-up': ['https://videos.pexels.com/video-files/4742661/4742661-hd_1920_1080_25fps.mp4','https://www.pexels.com/video/man-doing-a-push-up-at-the-gym-4742661/'],
  'Kettlebell push-up': ['https://videos.pexels.com/video-files/4812839/4812839-hd_1920_1080_25fps.mp4','https://www.pexels.com/video/video-of-man-doing-push-ups-exercises-4812839/'],
  'Barbell back squat': ['https://videos.pexels.com/video-files/5319755/5319755-hd_1920_1080_25fps.mp4','https://www.pexels.com/video/man-doing-barbell-squats-5319755/'],
  'Bodyweight squat': ['https://videos.pexels.com/video-files/6326764/6326764-hd_1920_1080_25fps.mp4','https://www.pexels.com/video/man-doing-squats-6326764/'],
  'Barbell warm-up squat': ['https://videos.pexels.com/video-files/6114481/6114481-hd_1920_1080_25fps.mp4','https://www.pexels.com/video/man-shoulder-squats-with-an-empty-barbell-6114481/'],
  'Treadmill finisher': ['https://videos.pexels.com/video-files/4065567/4065567-hd_1920_1080_30fps.mp4','https://www.pexels.com/video/a-person-running-using-the-treadmill-4065567/'],
  'Slow push-up hold': ['https://videos.pexels.com/video-files/6389834/6389834-hd_1920_1080_25fps.mp4','https://www.pexels.com/video/man-doing-push-ups-6389834/'],
  'Home push-up': ['https://videos.pexels.com/video-files/4367576/4367576-hd_1920_1080_30fps.mp4','https://www.pexels.com/video/a-man-doing-push-ups-4367576/']
};


const exerciseDbVideo = file => `/api/exercise-video?file=${encodeURIComponent(file)}`;
Object.assign(verifiedExerciseVideos, {
  'Barbell Bench Press':[exerciseDbVideo('barbell-bench-press.mp4')],
  'Dumbbell Palm Rotational Bent Over Row':[exerciseDbVideo('dumbbell-palm-rotational-bent-over-row.mp4')],
  'Seated Dumbbell Shoulder Press':[exerciseDbVideo('dumbbell-bench-seated-press.mp4')],
  'Pull-Up / Chin-Up':[exerciseDbVideo('chin-ups-pull-ups.mp4')],
  'Barbell Back Squat':[exerciseDbVideo('classic-barbell-squat.mp4')],
  'Dumbbell Deadlift':[exerciseDbVideo('dumbbell-deadlift.mp4')],
  'Lever Horizontal Leg Press':[exerciseDbVideo('lever-horizontal-leg-press.mp4')],
  'Treadmill Running':[exerciseDbVideo('treadmill-running.mp4')],
  'Cable Kneeling Crunch':[exerciseDbVideo('cable-kneeling-crunch.mp4')],
  'Hanging Straight Leg Raise':[exerciseDbVideo('hanging-straight-leg-raise.mp4')],
  'Lever Seated Crunch':[exerciseDbVideo('lever-seated-crunch-1.mp4')],
  'Vertical Leg Raise':[exerciseDbVideo('vertical-leg-raise-on-parallel-bars.mp4')],
  'Bicycle Twisting Crunch':[exerciseDbVideo('45-degree-bycicle-twisting-crunch.mp4')],
  'Push-Up':[exerciseDbVideo('push-ups.mp4')],
  'Close-Grip Push-Up':[exerciseDbVideo('close-grip-push-ups.mp4')],
  'Incline Push-Up':[exerciseDbVideo('incline-push-ups.mp4')],
  'Bench Dips':[exerciseDbVideo('bench-dips.mp4')],
  'Squat':[exerciseDbVideo('squat.mp4')],
  'Jump Step-Up':[exerciseDbVideo('jump-step-up.mp4')],
  'Donkey Calf Raise':[exerciseDbVideo('donkey-calf-raise.mp4')],
  'Burpee':[exerciseDbVideo('burpee.mp4')],
  'Jumping Jack':[exerciseDbVideo('jumping-jack.mp4')],
  'Side Plank':[exerciseDbVideo('side-bridge-side-plank.mp4')],
  'Lying Leg Raise':[exerciseDbVideo('lying-floor-leg-raise.mp4')],
  'Sit-Up':[exerciseDbVideo('sit-ups.mp4')],
  'V-Up':[exerciseDbVideo('v-up.mp4')],
  'Twisting Crunch':[exerciseDbVideo('twisting-crunch.mp4')]
});

function setGoal(goal) {
  trainingGoal = goal; writeLocal('form-training-goal', goal);
  document.querySelectorAll('.goal-switch button').forEach(button => button.classList.toggle('selected', button.dataset.goal === goal));
  const copy = programCopy[goal];
  document.querySelector('.week-hero h2').innerHTML = copy.title;
  document.querySelector('.week-hero p').textContent = copy.subtitle;
  document.getElementById('profile-goal').textContent = copy.label;
}
document.querySelectorAll('.goal-switch button').forEach(button => button.addEventListener('click', () => setGoal(button.dataset.goal)));
setGoal(trainingGoal);

function bindSingleChoice(selector, setter) {
  document.querySelectorAll(`${selector} button`).forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll(`${selector} button`).forEach(item => item.classList.remove('selected'));
    button.classList.add('selected'); setter(button.dataset.value);
  }));
}
bindSingleChoice('.location-choice', value => trainingPlace = value);
bindSingleChoice('.body-choice', value => trainingBody = value);

function bindSessionVideoButtons(scope = document) {
  scope.querySelectorAll('#session-list [data-exercise-name]').forEach((button, index) => {
    if (button.dataset.videoBound) return;
    button.dataset.videoBound = 'true';
    button.addEventListener('click', event => {
      event.preventDefault();
      if (!requireTodayWorkoutGenerated()) return;
      openExercise(button.dataset.exerciseName, index, scope.querySelectorAll('#session-list [data-exercise-name]').length);
    });
  });
}

function openExercise(name, index, total, options = {}) {
  if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
  const exercisePlace = options.place || trainingPlace;
  const home = exercisePlace === 'home';
  document.getElementById('exercise-position').textContent = `EXERCISE ${index + 1} OF ${total}`;
  document.getElementById('exercise-title').innerHTML = name.replace(' ', '<br>');
  document.getElementById('exercise-cue').textContent = home
    ? 'Move with control and stop the set when your form begins to change. Use a stable surface and clear the space around you.'
    : 'Choose a load that leaves two good repetitions in reserve. Keep the movement controlled through the full range.';
  document.getElementById('exercise-sets').textContent = trainingGoal === 'lose' ? '01 / 03' : '01 / 04';
  document.getElementById('exercise-reps').textContent = trainingGoal === 'muscle' ? '8–12' : trainingGoal === 'gain' ? '10–15' : '12–15';
  document.getElementById('exercise-rest').textContent = trainingGoal === 'lose' ? '45s' : '75s';
  const media = verifiedExerciseVideos[name];
  const player = document.getElementById('exercise-video');
  const unavailable = document.getElementById('video-unavailable');
  const credit = document.querySelector('.video-credit');
  player.pause();
  player.onerror = () => {
    player.removeAttribute('src'); player.load(); player.style.display = 'none'; unavailable.classList.add('show');
  };
  if (credit) credit.style.display = 'none';
  if (media) {
    player.src = media[0]; player.muted = true; player.load(); player.style.display = 'block'; unavailable.classList.remove('show');
  } else {
    player.removeAttribute('src'); player.load(); player.style.display = 'none'; unavailable.classList.add('show'); credit.style.display = 'none';
  }
  if (credit) credit.style.display = 'none';
  const sheet = document.getElementById('workout'); sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false');
  const workoutContent = sheet.querySelector('.sheet-content'); if (workoutContent) workoutContent.scrollTop = 0;
  setTimeout(() => document.activeElement?.blur?.(), 80);
  if (media) player.play().catch(() => {});
  window.dispatchEvent(new CustomEvent('exerciseOpened',{detail:{name,index,total,place:exercisePlace,goal:trainingGoal,body:trainingBody}}));
}

document.getElementById('exercise-video')?.addEventListener('touchstart', () => document.activeElement?.blur?.(), { passive:true });
document.querySelector('.video-stage')?.addEventListener('pointerdown', () => document.activeElement?.blur?.());
bindSessionVideoButtons();

document.getElementById('generate-workout').addEventListener('click', () => {
  markTodayWorkoutGenerated();
  setTrainPlanReadyState();
  const list = exercises[trainingPlace][trainingBody];
  const placeLabel = trainingPlace === 'gym' ? 'GYM' : 'HOME';
  const bodyLabel = document.querySelector('.body-choice .selected').textContent;
  document.querySelector('#plan .section-title span').textContent = `${placeLabel} · ${bodyLabel.toUpperCase()}`;
  document.querySelector('#plan .section-title h2').textContent = 'Today’s generated session';
  const container = document.getElementById('session-list'); container.innerHTML = '';
  list.forEach((name, index) => {
    const button = document.createElement('button'); button.className = 'session generated';
    button.dataset.exerciseName = name;
    button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><div><small>${placeLabel} · ${programCopy[trainingGoal].label.toUpperCase()}</small><h3>${name}</h3><p>${trainingGoal === 'lose' ? '3' : '4'} sets · form video included</p></div><b>▶</b>`;
    const playIcon = button.querySelector('b'); playIcon.textContent = ''; playIcon.className = 'session-play'; playIcon.setAttribute('aria-hidden','true');
    const completedToday = readLocal('form-exercise-completions',[]).some(item => item.exercise === name && isToday(item.date));
    if (completedToday) { button.classList.add('done'); button.querySelector('small').textContent = 'COMPLETED TODAY'; button.querySelector('b').textContent = '✓'; }
    button.addEventListener('click', () => { if (requireTodayWorkoutGenerated()) openExercise(button.dataset.exerciseName, index, list.length); }); container.appendChild(button);
  });
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  homeToast('Your workout is ready.');
});

setTrainPlanReadyState();
window.addEventListener('appDateChanged', setTrainPlanReadyState);
window.addEventListener('focus', setTrainPlanReadyState);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTrainPlanReadyState(); });

window.addEventListener('exerciseCompleted',event => {
  document.querySelectorAll('#session-list [data-exercise-name]').forEach(button => {
    if (button.dataset.exerciseName === event.detail.name) {
      button.classList.add('done'); button.querySelector('small').textContent = 'COMPLETED TODAY'; button.querySelector('b').textContent = '✓';
    }
  });
});

function renderTrainProfile() {
  const profile = readLocal('form-profile', null);
  const name = profile?.name || 'Guest profile';
  const email = profile?.email || 'Log in from the Today tab';
  const initials = profile ? profile.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase() : 'GU';
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = email;
  document.getElementById('profile-badge').textContent = initials;
  document.querySelectorAll('.profile-trigger').forEach(avatar => {
    avatar.textContent = profile ? initials : 'SK';
    avatar.classList.toggle('logged-in', Boolean(profile));
  });
  const logout = document.getElementById('logout-button'); logout.textContent = profile ? 'Log out' : 'Go to login';
}
renderTrainProfile();
document.querySelector('[data-open="train-profile"]')?.addEventListener('click', renderTrainProfile);
document.getElementById('logout-button').addEventListener('click', () => {
  const profile = readLocal('form-profile', null);
  if (!profile) {
    document.getElementById('train-profile').classList.remove('open');
    navigate('home'); document.getElementById('login').classList.add('open'); return;
  }
  localStorage.removeItem('form-profile');
  if (typeof renderProfile === 'function') renderProfile(null);
  else {
    document.querySelector('.topbar .avatar').textContent = 'SK';
    document.querySelector('.topbar .avatar').classList.remove('logged-in');
    if (typeof renderHomeHero === 'function') renderHomeHero(null);
  }
  renderTrainProfile(); document.getElementById('train-profile').classList.remove('open'); homeToast('You’re logged out.');
});


