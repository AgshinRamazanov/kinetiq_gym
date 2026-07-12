const programCopy = {
  muscle: { title: 'Forge<br>Foundation', subtitle: 'Progressive strength · 4 days/week', label: 'Build muscle' },
  lose: { title: 'Lean<br>Momentum', subtitle: 'Strength circuits · 5 days/week', label: 'Lose fat' },
  gain: { title: 'Mass<br>Method', subtitle: 'Hypertrophy & recovery · 4 days/week', label: 'Gain weight' }
};
let trainingGoal = readLocal('form-training-goal', 'muscle');
let trainingPlace = 'gym';
let trainingBody = 'upper';
const sessionsPerWeek = 4;
const totalProgramWeeks = 8;

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
function completedTrainingDays() {
  const completions = readLocal('form-exercise-completions', []);
  const items = Array.isArray(completions) ? completions : [];
  return new Set(items.map(item => {
    const date = new Date(item.date);
    return Number.isFinite(date.getTime()) ? localDateId(date) : null;
  }).filter(Boolean));
}
function currentProgramPosition() {
  const completedDays = completedTrainingDays().size;
  const maxSessions = sessionsPerWeek * totalProgramWeeks;
  const nextSession = Math.min(completedDays + 1, maxSessions);
  return {
    week: Math.floor((nextSession - 1) / sessionsPerWeek) + 1,
    day: ((nextSession - 1) % sessionsPerWeek) + 1,
    completedDays
  };
}
function renderTrainingProgress() {
  const progress = currentProgramPosition();
  const position = `WEEK ${progress.week} · DAY ${progress.day}`;
  const homePosition = document.getElementById('home-program-position');
  if (homePosition) homePosition.textContent = position;
  const weekNumber = document.getElementById('program-week-number');
  if (weekNumber) weekNumber.textContent = String(progress.week).padStart(2, '0');
  const weekRow = document.getElementById('week-row');
  if (weekRow) {
    weekRow.querySelectorAll('button').forEach((button, index) => {
      const week = index + 1;
      button.classList.toggle('active', week === progress.week);
      button.innerHTML = week < progress.week ? `${week}<small>✓</small>` : week === progress.week ? `${week}<small>NOW</small>` : `${week}`;
    });
  }
  const profileWeek = document.getElementById('profile-training-week');
  if (profileWeek) profileWeek.textContent = `${progress.week} of ${totalProgramWeeks}`;
  const profileWorkouts = document.getElementById('profile-workouts');
  if (profileWorkouts) profileWorkouts.textContent = `${progress.completedDays} completed`;
}

const exercises = {
  gym: {
    upper: ['Barbell Bench Press', 'Dumbbell Palm Rotational Bent Over Row', 'Seated Dumbbell Shoulder Press', 'Pull-Up / Chin-Up', 'Dumbbell Lateral Raise', 'Cable Pulldown', 'Dumbbell Incline Bench Press', 'Barbell Curl', 'Seated Cable Row (Wide-Grip)', 'Dumbbell Arnold Press', 'Cable Standing Fly'],
    push: ['Barbell Bench Press', 'Seated Dumbbell Shoulder Press', 'Close-Grip Push-Up', 'Bench Dips', 'Dumbbell Lateral Raise', 'Chest Dips', 'Dumbbell Incline Bench Press', 'Cable Standing Fly', 'Dumbbell Arnold Press', 'Barbell Close Grip Bench Press', 'Pec Deck Fly'],
    pull: ['Pull-Up / Chin-Up', 'Dumbbell Palm Rotational Bent Over Row', 'Dumbbell Deadlift', 'Hanging Straight Leg Raise', 'Cable Pulldown', 'Seated Cable Row (V-Grip)', 'Barbell Underhand Bent-Over Row', 'Wide Grip Cable Lat Pulldown', 'Cable Straight Arm Pulldown', 'Lever High Row', 'Barbell Curl'],
    lower: ['Barbell Back Squat', 'Dumbbell Deadlift', 'Lever Horizontal Leg Press', 'Treadmill Running', 'Dumbbell Lunge', 'Lever Leg Extension', 'Dumbbell Goblet Squat', 'Dumbbell Stiff Leg Deadlift', 'Lever Seated Leg Curl', 'Dumbbell Standing Calf Raise', 'Sled Hack Squat'],
    full: ['Barbell Back Squat', 'Barbell Bench Press', 'Dumbbell Palm Rotational Bent Over Row', 'Dumbbell Deadlift', 'Dumbbell Lunge', 'Cable Pulldown', 'Barbell Clean And Press', 'Dumbbell Goblet Squat', 'Dumbbell Incline Bench Press', 'Lever High Row', 'Dumbbell Standing Calf Raise'],
    core: ['Cable Kneeling Crunch', 'Hanging Straight Leg Raise', 'Lever Seated Crunch', 'Vertical Leg Raise', 'Bicycle Twisting Crunch']
  },
  home: {
    upper: ['Push-Up', 'Close-Grip Push-Up', 'Incline Push-Up', 'Bench Dips', 'Deep Push-Up', 'Inverted Row Between Chairs', 'Bench Pull-Up', 'Close Grip Chin-Up', 'Triceps Dips', 'Scapula Dips', 'Commando Pull-Up'],
    push: ['Push-Up', 'Close-Grip Push-Up', 'Incline Push-Up', 'Bench Dips', 'Deep Push-Up', 'Chest Dips', 'Triceps Dips', 'Old School Reverse Extensions', 'Standing Wheel Rollout', 'Scapula Dips', 'Dynamic Chest Stretch'],
    pull: ['Pull-Up / Chin-Up', 'Dumbbell Palm Rotational Bent Over Row', 'Superman', 'Reverse Snow Angel', 'Inverted Row Between Chairs', 'Pull-Up (Wide Grip)', 'Bench Pull-Up', 'Close Grip Chin-Up', 'Commando Pull-Up', 'Reverse Grip Pull-Up', 'Shoulder-Width Pull-Up'],
    lower: ['Squat', 'Jump Step-Up', 'Donkey Calf Raise', 'Burpee', 'Rear Decline Bridge', 'Running', 'Plyometric Side Lunge Stretch', 'Standing Knee Raise Stretch', 'Stairs Calf Stretch', 'Hip Circles Stretch', "Runner's Stretch"],
    full: ['Burpee', 'Squat', 'Push-Up', 'Jumping Jack', 'V-Up', 'Inverted Row Between Chairs', 'Rear Decline Bridge', 'Running', 'Bench Pull-Up', 'Triceps Dips', 'Plyometric Side Lunge Stretch', 'Hanging Leg Hip Raise', 'Cardio Exercise'],
    core: ['Side Plank', 'Lying Leg Raise', 'Sit-Up', 'V-Up', 'Twisting Crunch']
  }
};
window.setTrainingBody = value => {
  if (exercises[trainingPlace]?.[value]) trainingBody = value;
};

const generatedExerciseImages = [
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=360&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=360&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=360&q=80',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=360&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=360&q=80'
];

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
  'Twisting Crunch':[exerciseDbVideo('twisting-crunch.mp4')],
  'Dumbbell Lateral Raise':[exerciseDbVideo('dumbbell-lateral-raise.mp4')],
  'Cable Pulldown':[exerciseDbVideo('cable-pulldown.mp4')],
  'Chest Dips':[exerciseDbVideo('chest-dips.mp4')],
  'Seated Cable Row (V-Grip)':[exerciseDbVideo('cable-straight-back-seated-row-v-grip.mp4')],
  'Dumbbell Lunge':[exerciseDbVideo('dumbbell-lunge.mp4')],
  'Lever Leg Extension':[exerciseDbVideo('lever-leg-extension.mp4')],
  'Deep Push-Up':[exerciseDbVideo('deep-push-ups.mp4')],
  'Inverted Row Between Chairs':[exerciseDbVideo('inverted-row-between-chairs.mp4')],
  'Pull-Up (Wide Grip)':[exerciseDbVideo('pull-up-wide-front-grip.mp4')],
  'Rear Decline Bridge':[exerciseDbVideo('rear-decline-bridge.mp4')],
  'Running':[exerciseDbVideo('running.mp4')],
  'Dumbbell Incline Bench Press':[exerciseDbVideo('dumbbell-incline-bench-press.mp4')],
  'Barbell Curl':[exerciseDbVideo('barbell-curl.mp4')],
  'Seated Cable Row (Wide-Grip)':[exerciseDbVideo('cable-seated-row-wide-grip.mp4')],
  'Dumbbell Arnold Press':[exerciseDbVideo('dumbbell-arnold-press.mp4')],
  'Cable Standing Fly':[exerciseDbVideo('cable-standing-fly-crossover-fly.mp4')],
  'Barbell Close Grip Bench Press':[exerciseDbVideo('barbell-close-grip-bench-press.mp4')],
  'Pec Deck Fly':[exerciseDbVideo('lever-pec-deck-fly.mp4')],
  'Barbell Underhand Bent-Over Row':[exerciseDbVideo('barbell-underhand-bent-over-row.mp4')],
  'Wide Grip Cable Lat Pulldown':[exerciseDbVideo('cable-bar-lateral-pulldown-wide-shoulder-grip.mp4')],
  'Cable Straight Arm Pulldown':[exerciseDbVideo('cable-straight-arm-pulldown.mp4')],
  'Lever High Row':[exerciseDbVideo('lever-high-row.mp4')],
  'Dumbbell Goblet Squat':[exerciseDbVideo('dumbbell-goblet-squat.mp4')],
  'Dumbbell Stiff Leg Deadlift':[exerciseDbVideo('dumbbell-stiff-leg-deadlift.mp4')],
  'Lever Seated Leg Curl':[exerciseDbVideo('lever-seated-leg-curl.mp4')],
  'Dumbbell Standing Calf Raise':[exerciseDbVideo('dumbbell-standing-calf-raise.mp4')],
  'Sled Hack Squat':[exerciseDbVideo('sled-hack-squat.mp4')],
  'Barbell Clean And Press':[exerciseDbVideo('barbell-clean-and-press.mp4')],
  'Bench Pull-Up':[exerciseDbVideo('bench-pull-ups.mp4')],
  'Close Grip Chin-Up':[exerciseDbVideo('close-grip-chin-up.mp4')],
  'Triceps Dips':[exerciseDbVideo('triceps-dips.mp4')],
  'Scapula Dips':[exerciseDbVideo('scapula-dips.mp4')],
  'Commando Pull-Up':[exerciseDbVideo('commando-pull-up.mp4')],
  'Old School Reverse Extensions':[exerciseDbVideo('old-school-reverse-extensions.mp4')],
  'Standing Wheel Rollout':[exerciseDbVideo('stretching-standing-wheel-rollout.mp4')],
  'Dynamic Chest Stretch':[exerciseDbVideo('stretching-dynamic-chest-stretch.mp4')],
  'Reverse Grip Pull-Up':[exerciseDbVideo('reverse-grip-pull-up.mp4')],
  'Shoulder-Width Pull-Up':[exerciseDbVideo('pull-up-shoulder-grip.mp4')],
  'Plyometric Side Lunge Stretch':[exerciseDbVideo('stretching-plyo-side-lunge-stretch.mp4')],
  'Standing Knee Raise Stretch':[exerciseDbVideo('stretching-knee-raise.mp4')],
  'Stairs Calf Stretch':[exerciseDbVideo('stretching-stairs-calf-stretch.mp4')],
  'Hip Circles Stretch':[exerciseDbVideo('stretching-hip-circles-stretch.mp4')],
  "Runner's Stretch":[exerciseDbVideo('stretching-runners-stretch.mp4')],
  'Hanging Leg Hip Raise':[exerciseDbVideo('hanging-leg-hip-raise.mp4')],
  'Cardio Exercise':[exerciseDbVideo('cardio-exercises.mp4')]
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
  const bodyLabel = ({ upper: 'Upper body', push: 'Push', pull: 'Pull', lower: 'Lower body', full: 'Full body', core: 'Core' })[trainingBody] || 'Workout';
  document.querySelector('#plan .section-title span').textContent = `${placeLabel} · ${bodyLabel.toUpperCase()}`;
  document.querySelector('#plan .section-title h2').textContent = 'Today’s generated session';
  const container = document.getElementById('session-list'); container.innerHTML = '';
  list.forEach((name, index) => {
    const button = document.createElement('button'); button.className = 'session generated';
    button.dataset.exerciseName = name;
    button.innerHTML = `<i class="session-thumb" style="background-image:url('${generatedExerciseImages[index % generatedExerciseImages.length]}')"><span>${String(index + 1).padStart(2, '0')}</span></i><div><small>${placeLabel} · ${programCopy[trainingGoal].label.toUpperCase()}</small><h3>${name}</h3><p>${trainingGoal === 'lose' ? '3' : '4'} sets · ${trainingGoal === 'lose' ? '45' : '75'}s rest</p></div><b aria-hidden="true">›</b>`;
    const completedToday = readLocal('form-exercise-completions',[]).some(item => item.exercise === name && isToday(item.date));
    if (completedToday) { button.classList.add('done'); button.querySelector('small').textContent = 'COMPLETED TODAY'; button.querySelector('b').textContent = '✓'; }
    button.addEventListener('click', () => { if (requireTodayWorkoutGenerated()) openExercise(button.dataset.exerciseName, index, list.length); }); container.appendChild(button);
  });
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  homeToast('Your workout is ready.');
});

setTrainPlanReadyState();
renderTrainingProgress();
window.addEventListener('appDateChanged', setTrainPlanReadyState);
window.addEventListener('focus', setTrainPlanReadyState);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTrainPlanReadyState(); });

window.addEventListener('exerciseCompleted',event => {
  document.querySelectorAll('#session-list [data-exercise-name]').forEach(button => {
    if (button.dataset.exerciseName === event.detail.name) {
      button.classList.add('done'); button.querySelector('small').textContent = 'COMPLETED TODAY'; button.querySelector('b').textContent = '✓';
    }
  });
  renderTrainingProgress();
});
window.addEventListener('localDataChanged', event => {
  if (event.detail?.key === 'form-exercise-completions') renderTrainingProgress();
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
  renderTrainingProgress();
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


