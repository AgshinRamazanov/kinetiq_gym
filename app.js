const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('[data-nav]');
const bottomButtons = document.querySelectorAll('.bottom-nav button[data-nav]');

function navigate(id) {
  const update = () => {
    screens.forEach(s => s.classList.toggle('active', s.id === id));
    bottomButtons.forEach(b => b.classList.toggle('active', b.dataset.nav === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(update);
  else update();
}
navButtons.forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.nav)));

document.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
  const sheet = document.getElementById(btn.dataset.open);
  sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false');
}));
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => {
  const sheet = btn.closest('.sheet'); sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true');
  const video = sheet.querySelector('video'); if(video) video.pause();
}));
document.querySelectorAll('.sheet').forEach(sheet => sheet.addEventListener('click', e => {
  if(e.target === sheet) { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); }
}));

document.querySelectorAll('.goal-switch button').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.goal-switch button').forEach(b => b.classList.remove('selected')); btn.classList.add('selected');
  const title = document.querySelector('.week-hero h2');
  title.innerHTML = btn.textContent.includes('Lose') ? 'Lean &<br>Capable' : btn.textContent.includes('Gain') ? 'Strong<br>Surplus' : 'Forge<br>Foundation';
}));

const sex = document.getElementById('sex');
sex.addEventListener('change', () => document.querySelector('.hip-field').style.setProperty('display', sex.value === 'female' ? 'block' : 'none', 'important'));
document.getElementById('body-form').addEventListener('submit', e => {
  e.preventDefault();
  const h = +document.getElementById('height').value, w = +document.getElementById('waist').value, n = +document.getElementById('neck').value, hip = +document.getElementById('hip').value;
  const error = document.getElementById('body-error');
  const output = document.getElementById('calculated');
  error.classList.remove('show');
  output.classList.remove('show', 'high', 'low');

  if (!h || !w || !n || (sex.value === 'female' && !hip)) {
    error.textContent = 'Please enter every required measurement.';
    error.classList.add('show');
    return;
  }
  if (w <= n || (sex.value === 'female' && w + hip <= n)) {
    error.textContent = 'These measurements cannot produce a valid estimate. Check the waist, neck and hip values.';
    error.classList.add('show');
    return;
  }

  // The UI accepts centimeters; these Navy coefficients require inches internally.
  const heightIn = h / 2.54, waistIn = w / 2.54, neckIn = n / 2.54, hipIn = hip / 2.54;
  const result = sex.value === 'male'
    ? 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76
    : 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;

  if (!isFinite(result) || result < 1 || result > 70) {
    error.textContent = 'That result falls outside the method’s valid range. Please recheck how the measurements were taken.';
    error.classList.add('show');
    return;
  }

  const male = sex.value === 'male';
  let category, tone = '';
  if (result < (male ? 2 : 10)) { category = 'Below essential-fat range'; tone = 'low'; }
  else if (result <= (male ? 5 : 13)) { category = 'Essential-fat range'; tone = 'low'; }
  else if (result <= (male ? 13 : 20)) category = 'Athlete range';
  else if (result <= (male ? 17 : 24)) category = 'Fitness range';
  else if (result <= (male ? 24 : 31)) category = 'Average range';
  else { category = 'High body-fat range'; tone = 'high'; }

  output.querySelector('strong').textContent = result.toFixed(1) + '%';
  output.querySelector('span').textContent = category;
  const currentWeight = Number(document.getElementById('body-weight').value);
  const currentBmi = currentWeight / ((h / 100) ** 2);
  const currentAge = Number(document.getElementById('body-age').value);
  const bmiBasedFat = 1.20 * currentBmi + 0.23 * currentAge - 10.8 * (sex.value === 'male' ? 1 : 0) - 5.4;
  const currentBmiCategory = currentBmi < 18.5 ? 'Below range' : currentBmi < 25 ? 'Healthy range' : currentBmi < 30 ? 'Above range' : 'High range';
  document.getElementById('calculated-bmi').textContent = currentBmi.toFixed(1);
  document.getElementById('calculated-bmi-category').textContent = currentBmiCategory;
  document.getElementById('calculated-bmi-fat').textContent = `${bmiBasedFat.toFixed(1)}%`;
  if (tone) output.classList.add(tone);
  output.classList.add('show');
});

const toast = document.getElementById('toast');
document.querySelectorAll('[data-action="toast"]').forEach(btn => btn.addEventListener('click', () => { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); }));
document.querySelector('[data-action="legacy-next-exercise"]')?.addEventListener('click', () => { toast.textContent = 'Set complete — rest timer started.'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); });
