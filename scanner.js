const emptyIntake = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] };
let selectedFoodImage = null;
let scannedFood = null;

function currentIntakeKey() { return `form-daily-intake-${localDateId()}`; }
function dailyIntake() { return readLocal(currentIntakeKey(), { ...emptyIntake, meals:[] }); }
function saveIntakeMeal(meal) {
  const intake = dailyIntake();
  ['calories','protein','carbs','fat'].forEach(key => intake[key] += Number(meal[key]) || 0);
  intake.meals.push({ ...meal, logId:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`, addedAt: Date.now() });
  writeLocal(currentIntakeKey(),intake); renderTrackedIntake();
}
function removeIntakeMeal(logId) {
  const intake = dailyIntake();
  const removed = intake.meals.find(meal => (meal.logId || String(meal.addedAt)) === logId);
  intake.meals = intake.meals.filter(meal => (meal.logId || String(meal.addedAt)) !== logId);
  ['calories','protein','carbs','fat'].forEach(key => intake[key] = intake.meals.reduce((sum,meal) => sum + (Number(meal[key]) || 0),0));
  writeLocal(currentIntakeKey(),intake); renderTrackedIntake();
  homeToast(removed ? `${removed.name} removed from today.` : 'Meal removed.');
}
window.addPlannedMeal = mealButton => {
  const plannedId = mealButton.dataset.plannedId;
  if (dailyIntake().meals.some(meal => meal.plannedId === plannedId)) { homeToast('This planned meal is already logged.'); return; }
  const meal = { plannedId, source:'plan', name:mealButton.dataset.name, calories:Number(mealButton.dataset.calories), protein:Number(mealButton.dataset.protein), carbs:Number(mealButton.dataset.carbs), fat:Number(mealButton.dataset.fat) };
  saveIntakeMeal(meal); homeToast(`${meal.name} added to today.`);
};
function renderTrackedIntake() {
  const intake = dailyIntake();
  const goals = readLocal('form-daily-goals', defaultGoals);
  document.getElementById('tracked-calories').textContent = intake.calories.toLocaleString();
  document.getElementById('tracked-protein').textContent = intake.protein;
  document.getElementById('tracked-carbs').textContent = intake.carbs;
  document.getElementById('tracked-fat').textContent = intake.fat;
  document.querySelector('.ring').style.setProperty('--progress', Math.min(100, Math.round(intake.calories / goals.calories * 100)));
  if (typeof activeFuelTargets === 'function') {
    const targets = activeFuelTargets();
    ['protein','carbs','fat'].forEach(key => {
      const label = document.getElementById(`nutrition-${key}`);
      const bar = document.getElementById(`nutrition-${key}-bar`);
      if (label) label.textContent = `${targets[key]}g ${homeT('goal')} · ${intake[key]}g ${homeT('eaten')}`;
      if (bar) { const pct = Math.round(intake[key]/targets[key]*100); bar.style.width = `${Math.min(100,pct)}%`; bar.classList.toggle('daily-over',pct > 100); }
    });
  }
  const logged = document.getElementById('logged-meals');
  if (logged) logged.innerHTML = intake.meals.length ? intake.meals.slice().reverse().map(meal => `<article class="logged-meal"><div><small>${new Date(meal.addedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · ${homeT(meal.source === 'plan' ? 'MEAL PLAN' : meal.source === 'scan' ? 'SCANNED' : meal.source === 'repeat' ? 'REPEATED' : 'MANUAL')}</small><strong>${meal.name}</strong><p>P ${meal.protein}g · C ${meal.carbs}g · F ${meal.fat}g</p></div><div class="logged-actions"><b>${meal.calories} kcal</b><button data-remove-meal="${meal.logId || meal.addedAt}" aria-label="${homeT('Remove')} ${meal.name}">${homeT('Remove')}</button></div></article>`).join('') : `<p>${homeT('No meals logged yet.')}</p>`;
  document.querySelectorAll('#fuel-meal-list .meal').forEach(button => {
    const added = intake.meals.some(meal => meal.plannedId && meal.plannedId === button.dataset.plannedId);
    button.classList.toggle('added',added); button.querySelector('.meal-number').textContent = added ? '✓' : '+';
  });
}
function closeScanner() {
  const sheet = document.getElementById('scanner'); sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true');
}
function resetScanner() {
  selectedFoodImage = null; scannedFood = null;
  document.getElementById('food-photo').value = '';
  document.getElementById('scanner-start').classList.remove('hidden');
  document.getElementById('scan-result').classList.remove('ready');
  document.getElementById('analyze-food').disabled = true;
  document.getElementById('scan-status').textContent = 'Choose or take a clear food photo';
}
document.querySelectorAll('[data-open="scanner"]').forEach(button => button.addEventListener('click', resetScanner));
function compressFoodPhoto(file, maxDimension = 1280, quality = .76) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The selected photo could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This photo format is not supported.'));
      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const context = canvas.getContext('2d', { alpha: false });
        context.fillStyle = '#fff'; context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, mimeType:'image/jpeg', bytes:Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * .75), width, height });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
document.getElementById('food-photo').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 20 * 1024 * 1024) { homeToast('Please choose an image smaller than 20 MB.'); return; }
  const status = document.getElementById('scan-status'); status.textContent = 'Optimizing photo…';
  try {
    const compressed = await compressFoodPhoto(file);
    selectedFoodImage = { mimeType: compressed.mimeType, image: compressed.dataUrl.split(',')[1] };
    document.getElementById('scan-preview').src = compressed.dataUrl;
    const originalKb = Math.round(file.size / 1024), compressedKb = Math.round(compressed.bytes / 1024);
    const saving = originalKb ? Math.max(0, Math.round((1 - compressedKb / originalKb) * 100)) : 0;
    status.textContent = `Photo ready · ${compressedKb} KB${saving ? ` · ${saving}% smaller` : ''}`;
    document.getElementById('analyze-food').disabled = false;
  } catch (error) { selectedFoodImage = null; status.textContent = 'Choose another food photo'; homeToast(error.message); }
});

document.getElementById('analyze-food').addEventListener('click', async () => {
  if (!selectedFoodImage) return;
  const button = document.getElementById('analyze-food'); const camera = document.querySelector('#scanner .camera-view');
  button.disabled = true; button.textContent = 'Analyzing…'; camera.classList.add('loading'); document.getElementById('scan-status').textContent = 'Gemini is estimating portions and macros…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);
  try {
    const token = await window.getCloudAccessToken?.();
    const headers = {'Content-Type':'application/json'};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch('/api/scan-food',{ method:'POST', headers, body:JSON.stringify(selectedFoodImage), signal:controller.signal });
    const data = await response.json(); if (!response.ok) { const problem = new Error(data.error || 'Food analysis failed.'); problem.status = response.status; throw problem; }
    scannedFood = data;
    document.getElementById('scan-food-name').textContent = data.name;
    document.getElementById('scan-food-items').textContent = data.items.join(', ');
    document.getElementById('scan-calories').textContent = data.calories;
    document.getElementById('scan-protein').textContent = `${data.protein}g`;
    document.getElementById('scan-carbs').textContent = `${data.carbs}g`;
    document.getElementById('scan-fat').textContent = `${data.fat}g`;
    document.getElementById('scan-confidence').textContent = `${data.confidence.toUpperCase()} CONFIDENCE · ${data.assumptions}`;
    document.getElementById('scanner-start').classList.add('hidden'); document.getElementById('scan-result').classList.add('ready');
    document.getElementById('scan-status').textContent = 'Estimate ready — review before adding';
  } catch (error) {
    const timedOut = error.name === 'AbortError';
    const missingKey = /GEMINI_API_KEY|not configured/i.test(error.message);
    const temporary = timedOut || /high demand|temporar|429|503|network|failed to fetch/i.test(error.message);
    document.getElementById('scan-status').textContent = temporary ? 'Gemini is busy — please tap Analyze again' : 'Could not analyze this photo';
    if (timedOut) document.getElementById('scan-status').textContent = 'Scanner timed out — tap Analyze again';
    homeToast(timedOut ? 'Scanner took too long. Please retry.' : temporary ? 'Gemini is temporarily busy. Please retry in a moment.' : error.message);
    if (missingKey) {
      document.getElementById('scan-status').textContent = 'Scanner key is missing on the server';
      homeToast('Restart server.py with GEMINI_API_KEY set.');
    }
  } finally { clearTimeout(timeout); button.disabled = false; button.textContent = 'Analyze food'; camera.classList.remove('loading'); }
});

document.getElementById('add-scan').addEventListener('click', () => {
  if (!scannedFood) return;
  saveIntakeMeal({ ...scannedFood, source:'scan' }); closeScanner(); homeToast(`${scannedFood.name} added to today.`);
});
document.getElementById('discard-scan').addEventListener('click', () => { closeScanner(); homeToast('Meal left out for now.'); });
document.getElementById('logged-meals').addEventListener('click', event => {
  const button = event.target.closest('[data-remove-meal]');
  if (button) removeIntakeMeal(button.dataset.removeMeal);
});
window.addEventListener('goalsUpdated',renderTrackedIntake);
window.addEventListener('languageChanged',renderTrackedIntake);
window.addEventListener('fuelRendered',renderTrackedIntake);
window.addEventListener('appDateChanged',renderTrackedIntake);
window.addEventListener('focus',renderTrackedIntake);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderTrackedIntake()});
renderTrackedIntake();
