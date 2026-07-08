const substitutionPools = {
  upper: {
    home: ['Incline Push-Up', 'Push-Up', 'Close-Grip Push-Up', 'Bench Dips'],
    gym: ['Barbell Bench Press', 'Dumbbell Palm Rotational Bent Over Row', 'Seated Dumbbell Shoulder Press', 'Pull-Up / Chin-Up']
  },
  lower: {
    home: ['Squat', 'Donkey Calf Raise', 'Jump Step-Up', 'Burpee'],
    gym: ['Barbell Back Squat', 'Dumbbell Deadlift', 'Lever Horizontal Leg Press', 'Treadmill Running']
  },
  full: {
    home: ['Squat', 'Push-Up', 'Jumping Jack', 'V-Up', 'Burpee'],
    gym: ['Barbell Back Squat', 'Barbell Bench Press', 'Dumbbell Deadlift', 'Treadmill Running']
  },
  core: {
    home: ['Side Plank', 'Lying Leg Raise', 'Sit-Up', 'V-Up', 'Twisting Crunch'],
    gym: ['Cable Kneeling Crunch', 'Hanging Straight Leg Raise', 'Lever Seated Crunch', 'Vertical Leg Raise', 'Bicycle Twisting Crunch']
  }
};

const beginnerChoices = {
  upper: ['Incline Push-Up', 'Push-Up', 'Seated Dumbbell Shoulder Press'],
  lower: ['Squat', 'Donkey Calf Raise', 'Lever Horizontal Leg Press'],
  full: ['Squat', 'Incline Push-Up', 'Jumping Jack'],
  core: ['Side Plank', 'Lying Leg Raise', 'Lever Seated Crunch']
};

const injuryChoices = {
  knee: { upper: ['Incline Push-Up', 'Dumbbell Palm Rotational Bent Over Row', 'Seated Dumbbell Shoulder Press'], lower: ['Donkey Calf Raise', 'Dumbbell Deadlift'], full: ['Incline Push-Up', 'Dumbbell Palm Rotational Bent Over Row'], core: ['Side Plank', 'Cable Kneeling Crunch'] },
  shoulder: { upper: ['Dumbbell Palm Rotational Bent Over Row'], lower: ['Squat', 'Lever Horizontal Leg Press'], full: ['Squat', 'Lever Horizontal Leg Press'], core: ['Lying Leg Raise', 'Lever Seated Crunch'] },
  back: { upper: ['Incline Push-Up', 'Seated Dumbbell Shoulder Press'], lower: ['Donkey Calf Raise', 'Lever Horizontal Leg Press'], full: ['Incline Push-Up', 'Jumping Jack'], core: ['Side Plank', 'Lever Seated Crunch'] }
};

let substitutionExercise = null;
const workoutCopy = document.querySelector('.exercise-copy');
const swapTrigger = document.createElement('button');
swapTrigger.type = 'button'; swapTrigger.id = 'substitute-exercise'; swapTrigger.className = 'substitute-trigger';
swapTrigger.innerHTML = '<span>Need another movement?</span><b>Swap exercise ↻</b>';
workoutCopy.insertBefore(swapTrigger, document.getElementById('rest-timer'));

const swapSheet = document.createElement('div');
swapSheet.className = 'sheet substitution-sheet'; swapSheet.id = 'exercise-substitution'; swapSheet.setAttribute('aria-hidden','true');
swapSheet.innerHTML = `<div class="sheet-content substitution-content"><button class="close" type="button">×</button><p class="eyebrow">SMART SUBSTITUTION</p><h2>Make the movement<br><em>work for you.</em></h2><p class="muted" id="substitution-current"></p><div class="substitution-reasons"><button data-reason="equipment">No equipment</button><button data-reason="injury">Injury limitation</button><button data-reason="beginner">Beginner difficulty</button><button data-reason="different">Different equipment</button><button data-reason="dislike">I dislike this exercise</button></div><label class="injury-area" id="injury-area">AREA TO PROTECT<select><option value="knee">Knee / ankle</option><option value="shoulder">Shoulder / wrist</option><option value="back">Back / hip</option></select></label><div class="substitution-results" id="substitution-results"><p>Choose a reason to see alternatives.</p></div><p class="substitution-note">For pain or an active injury, stop exercising and follow guidance from a qualified healthcare professional.</p></div>`;
document.querySelector('.phone-shell').appendChild(swapSheet);

function uniqueAlternatives(items) {
  return [...new Set(items)].filter(name => name !== substitutionExercise.name).slice(0, 5);
}

function alternativePlace(name) {
  return Object.values(substitutionPools).some(pool => pool.home.includes(name)) ? 'home' : 'gym';
}

function renderSubstitutions(reason) {
  const body = substitutionExercise.body || 'full';
  const injury = document.querySelector('#injury-area select').value;
  document.getElementById('injury-area').classList.toggle('show', reason === 'injury');
  let choices;
  if (reason === 'equipment') choices = substitutionPools[body].home;
  else if (reason === 'beginner') choices = beginnerChoices[body];
  else if (reason === 'injury') choices = injuryChoices[injury][body];
  else if (reason === 'different') choices = substitutionPools[body][substitutionExercise.place === 'gym' ? 'home' : 'gym'];
  else choices = [...substitutionPools[body].home, ...substitutionPools[body].gym];
  const results = document.getElementById('substitution-results');
  results.innerHTML = '';
  uniqueAlternatives(choices).forEach(name => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'substitution-option';
    const place = alternativePlace(name);
    button.innerHTML = `<span>${place === 'home' ? 'NO EQUIPMENT' : 'GYM EQUIPMENT'}</span><b>${name}</b><small>Use this alternative →</small>`;
    button.addEventListener('click', () => applySubstitution(name, place)); results.appendChild(button);
  });
}

function applySubstitution(name, place) {
  const oldName = substitutionExercise.name;
  const row = [...document.querySelectorAll('#session-list [data-exercise-name]')].find(item => item.dataset.exerciseName === oldName);
  if (row) { row.dataset.exerciseName = name; row.querySelector('h3').textContent = name; row.querySelector('small').textContent = `${place.toUpperCase()} · SUBSTITUTED`; }
  swapSheet.classList.remove('open'); swapSheet.setAttribute('aria-hidden','true');
  document.getElementById('workout').classList.add('open');
  openExercise(name, substitutionExercise.index, substitutionExercise.total, {place});
  homeToast(`${name} added to your workout.`);
}

window.addEventListener('exerciseOpened', event => { substitutionExercise = event.detail; });
swapTrigger.addEventListener('click', () => {
  if (!substitutionExercise) return;
  document.getElementById('substitution-current').textContent = `Replacing ${substitutionExercise.name}`;
  document.getElementById('workout').classList.remove('open');
  swapSheet.classList.add('open'); swapSheet.setAttribute('aria-hidden','false');
});
swapSheet.querySelector('.close').addEventListener('click', () => { swapSheet.classList.remove('open'); swapSheet.setAttribute('aria-hidden','true'); document.getElementById('workout').classList.add('open'); });
document.querySelectorAll('.substitution-reasons button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.substitution-reasons button').forEach(item => item.classList.toggle('selected', item === button)); renderSubstitutions(button.dataset.reason);
}));
document.querySelector('#injury-area select').addEventListener('change', () => renderSubstitutions('injury'));
