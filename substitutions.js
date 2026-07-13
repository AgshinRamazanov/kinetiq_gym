const substitutionCatalog = {
  push: { home: ['Incline Push-Up', 'Push-Up', 'Close-Grip Push-Up', 'Bench Dips', 'Deep Push-Up', 'Chest Dips', 'Triceps Dips', 'Old School Reverse Extensions', 'Standing Wheel Rollout', 'Scapula Dips', 'Dynamic Chest Stretch'], gym: ['Barbell Bench Press', 'Seated Dumbbell Shoulder Press', 'Dumbbell Lateral Raise', 'Chest Dips', 'Dumbbell Incline Bench Press', 'Cable Standing Fly', 'Dumbbell Arnold Press', 'Barbell Close Grip Bench Press', 'Pec Deck Fly'] },
  pull: { home: ['Superman', 'Reverse Snow Angel', 'Inverted Row Between Chairs', 'Pull-Up (Wide Grip)', 'Bench Pull-Up', 'Close Grip Chin-Up', 'Commando Pull-Up', 'Reverse Grip Pull-Up', 'Shoulder-Width Pull-Up'], gym: ['Dumbbell Palm Rotational Bent Over Row', 'Pull-Up / Chin-Up', 'Cable Pulldown', 'Seated Cable Row (V-Grip)', 'Barbell Underhand Bent-Over Row', 'Wide Grip Cable Lat Pulldown', 'Cable Straight Arm Pulldown', 'Lever High Row', 'Barbell Curl', 'Seated Cable Row (Wide-Grip)'] },
  lower: { home: ['Squat', 'Donkey Calf Raise', 'Jump Step-Up', 'Rear Decline Bridge', 'Running', 'Plyometric Side Lunge Stretch', 'Standing Knee Raise Stretch', 'Stairs Calf Stretch', 'Hip Circles Stretch', "Runner's Stretch"], gym: ['Barbell Back Squat', 'Dumbbell Deadlift', 'Lever Horizontal Leg Press', 'Dumbbell Lunge', 'Lever Leg Extension', 'Dumbbell Goblet Squat', 'Dumbbell Stiff Leg Deadlift', 'Lever Seated Leg Curl', 'Dumbbell Standing Calf Raise', 'Sled Hack Squat'] },
  conditioning: { home: ['Burpee', 'Jumping Jack', 'Cardio Exercise'], gym: ['Treadmill Running', 'Barbell Clean And Press'] },
  core: { home: ['Side Plank', 'Lying Leg Raise', 'Sit-Up', 'V-Up', 'Twisting Crunch', 'Hanging Leg Hip Raise'], gym: ['Cable Kneeling Crunch', 'Hanging Straight Leg Raise', 'Lever Seated Crunch', 'Vertical Leg Raise', 'Bicycle Twisting Crunch'] }
};

const exerciseGroup = Object.entries(substitutionCatalog).reduce((groups, [group, places]) => {
  [...places.home, ...places.gym].forEach(name => { groups[name] = group; });
  return groups;
}, {});

const beginnerChoices = {
  push: ['Incline Push-Up', 'Push-Up', 'Seated Dumbbell Shoulder Press'],
  pull: ['Superman', 'Reverse Snow Angel', 'Dumbbell Palm Rotational Bent Over Row'],
  lower: ['Squat', 'Donkey Calf Raise', 'Lever Horizontal Leg Press'],
  conditioning: ['Jumping Jack', 'Treadmill Running'],
  core: ['Side Plank', 'Lying Leg Raise', 'Lever Seated Crunch']
};

const injuryChoices = {
  knee: { push: ['Incline Push-Up', 'Seated Dumbbell Shoulder Press'], pull: ['Superman', 'Dumbbell Palm Rotational Bent Over Row'], lower: ['Donkey Calf Raise', 'Dumbbell Deadlift'], conditioning: [], core: ['Side Plank', 'Cable Kneeling Crunch'] },
  shoulder: { push: ['Incline Push-Up'], pull: ['Superman'], lower: ['Squat', 'Lever Horizontal Leg Press'], conditioning: ['Treadmill Running'], core: ['Lying Leg Raise', 'Lever Seated Crunch'] },
  back: { push: ['Incline Push-Up', 'Seated Dumbbell Shoulder Press'], pull: ['Reverse Snow Angel'], lower: ['Donkey Calf Raise', 'Lever Horizontal Leg Press'], conditioning: ['Jumping Jack'], core: ['Side Plank', 'Lever Seated Crunch'] }
};

const translateSubstitution = text => window.KinetiqI18n?.t?.(text) || text;
let substitutionExercise = null;
const workoutCopy = document.querySelector('.exercise-copy');
const swapTrigger = document.createElement('button');
swapTrigger.type = 'button';
swapTrigger.id = 'substitute-exercise';
swapTrigger.className = 'substitute-trigger';
swapTrigger.innerHTML = '<span>Need another movement?</span><b>Swap exercise ↻</b>';
workoutCopy.insertBefore(swapTrigger, document.getElementById('rest-timer'));

const swapSheet = document.createElement('div');
swapSheet.className = 'sheet substitution-sheet';
swapSheet.id = 'exercise-substitution';
swapSheet.setAttribute('aria-hidden', 'true');
swapSheet.innerHTML = `<div class="sheet-content substitution-content"><button class="close" type="button" aria-label="Close exercise substitution">×</button><p class="eyebrow">SMART SUBSTITUTION</p><h2>Make the movement<br><em>work for you.</em></h2><p class="muted" id="substitution-current"></p><div class="substitution-reasons"><button data-reason="equipment">No equipment</button><button data-reason="injury">Injury limitation</button><button data-reason="beginner">Beginner difficulty</button><button data-reason="different">Different equipment</button><button data-reason="dislike">I dislike this exercise</button></div><label class="injury-area" id="injury-area">AREA TO PROTECT<select><option value="knee">Knee / ankle</option><option value="shoulder">Shoulder / wrist</option><option value="back">Back / hip</option></select></label><div class="substitution-results" id="substitution-results"><p>Choose a reason to see alternatives.</p></div><p class="substitution-note">Alternatives are limited to the same body group. For pain or an active injury, stop exercising and follow guidance from a qualified healthcare professional.</p></div>`;
document.querySelector('.phone-shell').appendChild(swapSheet);

function alternativesForCurrentExercise() {
  const body = ['upper', 'push', 'pull', 'lower', 'full', 'core'].includes(substitutionExercise?.body)
    ? substitutionExercise.body
    : null;
  const group = exerciseGroup[substitutionExercise?.name] || 'conditioning';
  const planCatalog = body && window.getTrainingExercisePool
    ? { home: window.getTrainingExercisePool('home', body), gym: window.getTrainingExercisePool('gym', body) }
    : null;
  return { group, catalog: planCatalog || substitutionCatalog[group] || substitutionCatalog.conditioning };
}

function uniqueAlternatives(items) {
  const sessionExercises = new Set(
    [...document.querySelectorAll('#session-list [data-exercise-name]')]
      .map(row => row.dataset.exerciseName)
  );
  return [...new Set(items)]
    .filter(name => name !== substitutionExercise.name && !sessionExercises.has(name))
    .slice(0, 5);
}

function alternativePlace(name, catalog) {
  return catalog.home.includes(name) ? 'home' : 'gym';
}

function renderSubstitutions(reason) {
  const { group, catalog } = alternativesForCurrentExercise();
  const injury = document.querySelector('#injury-area select').value;
  document.getElementById('injury-area').classList.toggle('show', reason === 'injury');
  let choices;
  if (reason === 'equipment') choices = catalog.home;
  else if (reason === 'beginner') choices = beginnerChoices[group] || [];
  else if (reason === 'injury') choices = injuryChoices[injury]?.[group] || [];
  else if (reason === 'different') choices = catalog[substitutionExercise.place === 'gym' ? 'home' : 'gym'];
  else choices = [...catalog.home, ...catalog.gym];
  const allowedInPlan = new Set([...catalog.home, ...catalog.gym]);
  choices = choices.filter(name => allowedInPlan.has(name));
  if (!choices.length && (reason === 'beginner' || reason === 'injury')) {
    choices = [...catalog.home, ...catalog.gym];
  }
  const results = document.getElementById('substitution-results');
  results.innerHTML = '';
  const alternatives = uniqueAlternatives(choices);
  if (!alternatives.length) {
    const empty = document.createElement('p');
    empty.textContent = translateSubstitution('No suitable same-group alternative is available for this reason.');
    results.appendChild(empty);
    return;
  }
  alternatives.forEach(name => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'substitution-option';
    const place = alternativePlace(name, catalog);
    button.innerHTML = `<span>${translateSubstitution(place === 'home' ? 'NO EQUIPMENT' : 'GYM EQUIPMENT')}</span><b>${name}</b><small>${translateSubstitution('Select replacement')} →</small>`;
    button.addEventListener('click', () => applySubstitution(name, place));
    results.appendChild(button);
  });
}

function applySubstitution(name, place) {
  const oldName = substitutionExercise.name;
  const rows = [...document.querySelectorAll('#session-list [data-exercise-name]')];
  const row = rows[substitutionExercise.index] || rows.find(item => item.dataset.exerciseName === oldName);
  if (row) {
    row.dataset.exerciseName = name;
    row.querySelector('h3').textContent = name;
    row.querySelector('small').textContent = translateSubstitution(`${place.toUpperCase()} · SUBSTITUTED`);
  }
  swapSheet.classList.remove('open');
  swapSheet.setAttribute('aria-hidden', 'true');
  document.getElementById('workout').classList.remove('open');
  document.getElementById('workout').setAttribute('aria-hidden', 'true');
  substitutionExercise = null;
  homeToast(`${name} ${translateSubstitution('saved as the replacement. Start from any exercise.')}`);
  row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.addEventListener('exerciseOpened', event => { substitutionExercise = event.detail; });
swapTrigger.addEventListener('click', () => {
  if (!substitutionExercise) return;
  document.getElementById('substitution-current').textContent = `${translateSubstitution('Replacing')} ${substitutionExercise.name}`;
  document.getElementById('workout').classList.remove('open');
  document.getElementById('workout').setAttribute('aria-hidden', 'true');
  swapSheet.classList.add('open');
  swapSheet.setAttribute('aria-hidden', 'false');
  swapSheet.querySelector('.sheet-content').scrollTop = 0;
});
swapSheet.querySelector('.close').addEventListener('click', () => {
  swapSheet.classList.remove('open');
  swapSheet.setAttribute('aria-hidden', 'true');
  document.getElementById('workout').classList.add('open');
  document.getElementById('workout').setAttribute('aria-hidden', 'false');
});
document.querySelectorAll('.substitution-reasons button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.substitution-reasons button').forEach(item => item.classList.toggle('selected', item === button));
  renderSubstitutions(button.dataset.reason);
}));
document.querySelector('#injury-area select').addEventListener('change', () => renderSubstitutions('injury'));
