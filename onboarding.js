let onboardingStep = 0;
const onboardingSheet = document.getElementById('onboarding');
const onboardingSteps = [...document.querySelectorAll('.onboard-step')];

function setupRadio(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value; }
function openOnboarding(editing = false) {
  const saved = readLocal('form-onboarding', null), profile = readLocal('form-profile', null);
  if (saved) {
    document.getElementById('setup-name').value = saved.name || profile?.name || '';
    ['goal','level','place'].forEach(key => { const input = document.querySelector(`input[name="setup-${key}"][value="${saved[key]}"]`); if(input) input.checked = true; });
    ['sex','age','height','weight','days','duration','diet','allergies','injuries'].forEach(key => { const input = document.getElementById(`setup-${key}`); if(input && saved[key] != null) input.value = saved[key]; });
    document.querySelectorAll('input[name="setup-equipment"]').forEach(input => input.checked = saved.equipment?.includes(input.value));
  } else if (profile?.name) document.getElementById('setup-name').value = profile.name;
  onboardingStep = editing ? 0 : onboardingStep;
  showOnboardingStep();
  onboardingSheet.classList.add('open'); onboardingSheet.setAttribute('aria-hidden','false');
}
function closeOnboarding() { onboardingSheet.classList.remove('open'); onboardingSheet.setAttribute('aria-hidden','true'); }
function showOnboardingStep() {
  onboardingSteps.forEach((step,index) => step.classList.toggle('active',index === onboardingStep));
  document.getElementById('onboard-progress').style.width = `${(onboardingStep + 1) / onboardingSteps.length * 100}%`;
  document.getElementById('onboard-back').style.visibility = onboardingStep ? 'visible' : 'hidden';
  document.getElementById('onboard-next').innerHTML = onboardingStep === onboardingSteps.length - 1 ? 'Build my starting plan <span>→</span>' : 'Continue <span>→</span>';
  if (onboardingStep === onboardingSteps.length - 1) renderSetupPreview();
}
function validateSetupStep() {
  const step = onboardingSteps[onboardingStep];
  const fields = [...step.querySelectorAll('input[required],select[required]')];
  const invalid = fields.find(field => !field.checkValidity());
  if (invalid) { invalid.reportValidity(); return false; }
  return true;
}
function suggestedTargets() {
  const sex = document.getElementById('setup-sex').value, age = +document.getElementById('setup-age').value;
  const height = +document.getElementById('setup-height').value, weight = +document.getElementById('setup-weight').value;
  const days = +document.getElementById('setup-days').value, goal = setupRadio('setup-goal');
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
  const activity = days <= 2 ? 1.3 : days <= 4 ? 1.5 : 1.65;
  let calories = bmr * activity + (goal === 'lose' ? -400 : goal === 'gain' ? 300 : 200);
  calories = Math.round(Math.max(1200,Math.min(4500,calories)) / 10) * 10;
  const protein = Math.round(weight * (goal === 'gain' ? 1.7 : 1.8));
  const fat = Math.round(weight * .8);
  const carbs = Math.max(50,Math.round((calories - protein * 4 - fat * 9) / 4));
  return { calories, protein, carbs, fat, water: Math.round(weight * .035 * 10) / 10 };
}
function renderSetupPreview() {
  const goals = suggestedTargets();
  document.getElementById('preview-calories').textContent = `${goals.calories.toLocaleString()} kcal`;
  document.getElementById('preview-macros').textContent = `P ${goals.protein}g · C ${goals.carbs}g · F ${goals.fat}g · Water ${goals.water}L`;
}
function finishOnboarding() {
  const existingProfile = readLocal('form-profile', {}), name = document.getElementById('setup-name').value.trim();
  const setup = {
    name, goal:setupRadio('setup-goal'), sex:document.getElementById('setup-sex').value,
    age:+document.getElementById('setup-age').value, height:+document.getElementById('setup-height').value,
    weight:+document.getElementById('setup-weight').value, level:setupRadio('setup-level'), place:setupRadio('setup-place'),
    days:+document.getElementById('setup-days').value, duration:+document.getElementById('setup-duration').value,
    equipment:[...document.querySelectorAll('input[name="setup-equipment"]:checked')].map(input => input.value),
    diet:document.getElementById('setup-diet').value, allergies:document.getElementById('setup-allergies').value.trim(), injuries:document.getElementById('setup-injuries').value.trim()
  };
  writeLocal('form-onboarding',setup); writeLocal('form-profile',{...existingProfile,name}); writeLocal('form-training-goal',setup.goal);
  const goals = suggestedTargets(); writeLocal('form-daily-goals',goals);
  dailyGoals = goals; renderGoals(); renderProfile({...existingProfile,name}); setGoal(setup.goal);
  const placeButton = document.querySelector(`.location-choice [data-value="${setup.place}"]`); if(placeButton) placeButton.click();
  document.getElementById('sex').value = setup.sex; document.getElementById('body-age').value = setup.age;
  document.getElementById('height').value = setup.height; document.getElementById('body-weight').value = setup.weight;
  window.dispatchEvent(new CustomEvent('goalsUpdated',{detail:goals}));
  closeOnboarding(); homeToast('Your personal starting plan is ready.');
}

document.getElementById('onboard-next').addEventListener('click', () => {
  if (!validateSetupStep()) return;
  if (onboardingStep < onboardingSteps.length - 1) { onboardingStep += 1; showOnboardingStep(); }
  else finishOnboarding();
});
document.getElementById('onboard-back').addEventListener('click', () => { if(onboardingStep){onboardingStep -= 1;showOnboardingStep();} });
document.getElementById('onboard-skip').addEventListener('click', closeOnboarding);
document.getElementById('edit-setup').addEventListener('click', () => { document.getElementById('train-profile').classList.remove('open'); openOnboarding(true); });
['setup-goal','setup-sex'].forEach(name => document.querySelectorAll(`[name="${name}"]`).forEach(input => input.addEventListener('change',renderSetupPreview)));
document.getElementById('setup-sex').addEventListener('change',renderSetupPreview);
['setup-age','setup-height','setup-weight','setup-days'].forEach(id => document.getElementById(id).addEventListener('input',renderSetupPreview));

if (!readLocal('form-onboarding',null)) setTimeout(() => openOnboarding(false),350);
