let activeExercise = null;
let completedSets = [];
let restInterval = null;
let awaitingExerciseSave = false;

function workoutHistory() { return readLocal('form-workout-history', []); }
function exerciseHistory(name) { return workoutHistory().filter(entry => entry.exercise === name); }
function renderExerciseBest() {
  if (!activeExercise) return;
  const history = exerciseHistory(activeExercise.name);
  const best = document.getElementById('exercise-best');
  if (!history.length) { best.textContent = 'No sets logged yet'; return; }
  if (activeExercise.place === 'home') {
    const record = history.reduce((top,set) => set.reps > top.reps ? set : top,history[0]);
    best.textContent = `${record.reps} reps · bodyweight`;
  } else {
    const record = history.reduce((top,set) => set.weight > top.weight || (set.weight === top.weight && set.reps > top.reps) ? set : top,history[0]);
    best.textContent = `${record.weight} kg × ${record.reps}`;
  }
}
function stopRestTimer() {
  clearInterval(restInterval); restInterval = null; document.getElementById('rest-timer').classList.remove('show');
  const button = document.getElementById('complete-set');
  if (button && activeExercise && !awaitingExerciseSave) {
    button.disabled = false;
    button.innerHTML = 'Complete set <span>→</span>';
  }
}
function startRestTimer(seconds) {
  stopRestTimer();
  let remaining = seconds; const timer = document.getElementById('rest-timer'), countdown = document.getElementById('rest-countdown');
  const button = document.getElementById('complete-set');
  button.disabled = true; button.innerHTML = 'Resting… <span>⏱</span>';
  countdown.textContent = remaining; timer.classList.add('show');
  restInterval = setInterval(() => {
    remaining -= 1; countdown.textContent = remaining;
    if (remaining <= 0) { stopRestTimer(); homeToast('Rest complete — ready for the next set.'); }
  },1000);
}
function renderCompletedSets() {
  document.getElementById('logged-sets').innerHTML = completedSets.map((set,index) => `<div class="logged-set"><span>✓</span><b>Set ${index + 1} · ${set.reps} reps${set.weight ? ` × ${set.weight} kg` : ''}</b><small>${set.effort}</small></div>`).join('');
  const current = Math.min(completedSets.length + 1,activeExercise.targetSets);
  document.getElementById('exercise-sets').textContent = `${String(current).padStart(2,'0')} / ${String(activeExercise.targetSets).padStart(2,'0')}`;
}
function saveWorkoutSet(set) {
  const history = workoutHistory(); history.push(set); writeLocal('form-workout-history',history.slice(-500));
}
window.addEventListener('exerciseOpened',event => {
  stopRestTimer(); completedSets = []; awaitingExerciseSave = false;
  const detail = event.detail, targetSets = detail.goal === 'lose' ? 3 : 4, targetReps = detail.goal === 'muscle' ? 10 : detail.goal === 'gain' ? 12 : 15, rest = detail.goal === 'lose' ? 45 : 75;
  activeExercise = {...detail,targetSets,targetReps,rest};
  document.getElementById('exercise-sets').textContent = `01 / ${String(targetSets).padStart(2,'0')}`;
  document.getElementById('exercise-reps').textContent = `${targetReps}`; document.getElementById('exercise-rest').textContent = `${rest}s`;
  document.getElementById('set-reps-input').value = targetReps;
  const weight = document.getElementById('set-weight-input'), entry = document.querySelector('.set-entry');
  const prior = exerciseHistory(detail.name); weight.value = detail.place === 'home' ? 0 : (prior.length ? prior[prior.length - 1].weight : 0);
  weight.disabled = detail.place === 'home'; entry.classList.toggle('bodyweight',detail.place === 'home');
  const button = document.getElementById('complete-set'); button.disabled = false; button.innerHTML = 'Complete set <span>→</span>';
  renderCompletedSets(); renderExerciseBest();
});

document.getElementById('complete-set').addEventListener('click', () => {
  if (!activeExercise) return;
  if (awaitingExerciseSave) {
    const completions = readLocal('form-exercise-completions',[]);
    completions.push({exercise:activeExercise.name,date:Date.now(),sets:completedSets.length,reps:completedSets.reduce((sum,set)=>sum+set.reps,0)});
    writeLocal('form-exercise-completions',completions.slice(-200));
    window.dispatchEvent(new CustomEvent('exerciseCompleted',{detail:{name:activeExercise.name,sets:completedSets.length}}));
    document.getElementById('workout').classList.remove('open'); document.getElementById('workout').setAttribute('aria-hidden','true');
    homeToast(`${activeExercise.name} saved as complete.`); activeExercise = null; awaitingExerciseSave = false; return;
  }
  if (completedSets.length >= activeExercise.targetSets) return;
  const reps = Number(document.getElementById('set-reps-input').value), weight = Number(document.getElementById('set-weight-input').value), effort = document.getElementById('set-effort-input').value;
  if (!reps || reps < 1 || weight < 0) { homeToast('Enter a valid repetition and weight value.'); return; }
  const set = {exercise:activeExercise.name,reps,weight:activeExercise.place === 'home' ? 0 : weight,effort,place:activeExercise.place,goal:activeExercise.goal,date:Date.now()};
  completedSets.push(set); saveWorkoutSet(set); renderCompletedSets(); renderExerciseBest();
  if (completedSets.length >= activeExercise.targetSets) {
    stopRestTimer(); awaitingExerciseSave = true;
    const button = document.getElementById('complete-set'); button.disabled = false; button.innerHTML = 'Save exercise completion <span>✓</span>';
    homeToast('All sets done — save the exercise to finish.');
  } else startRestTimer(activeExercise.rest);
});
document.getElementById('skip-rest').addEventListener('click',stopRestTimer);
document.querySelector('#workout .close').addEventListener('click',stopRestTimer);
