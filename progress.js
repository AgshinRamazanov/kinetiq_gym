function readCheckins() { return readLocal('form-body-checkins', []).filter(item=>Number.isFinite(new Date(item.date).getTime())).sort((a,b)=>new Date(a.date)-new Date(b.date)); }
function signedChange(value, unit) {
  if (Math.abs(value) < .05) return `No change`;
  return `${value > 0 ? '↑' : '↓'} ${Math.abs(value).toFixed(1)}${unit}`;
}
function shortDate(timestamp) { return new Date(timestamp).toLocaleDateString(undefined,{month:'short',day:'numeric'}).toUpperCase(); }
function bmiCategory(bmi) { return bmi < 18.5 ? 'Below range' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Above range' : 'High range'; }

function renderProgress() {
  const history = readCheckins().slice(-8);
  const list = document.getElementById('checkin-history');
  if (!history.length) {
    document.getElementById('progress-bodyfat').textContent = '—';
    document.getElementById('progress-weight').textContent = '—';
    document.getElementById('progress-lean').textContent = '—';
    document.getElementById('progress-bmi').textContent = '—';
    document.getElementById('progress-bmi-fat').textContent = '—';
    document.getElementById('progress-line').setAttribute('d','');
    document.getElementById('progress-area').setAttribute('d','');
    document.getElementById('progress-dot').setAttribute('r','0');
    list.innerHTML = '<p>No saved check-ins yet.</p>'; return;
  }
  const latest = history[history.length - 1], first = history[0], previous = history.length > 1 ? history[history.length - 2] : null;
  document.getElementById('progress-bodyfat').textContent = latest.bodyFat.toFixed(1);
  document.getElementById('progress-weight').textContent = latest.weight.toFixed(1);
  document.getElementById('progress-lean').textContent = latest.leanMass.toFixed(1);
  const latestBmi = latest.bmi || latest.weight / ((latest.height/100) ** 2);
  document.getElementById('progress-bmi').textContent = latestBmi.toFixed(1);
  document.getElementById('bmi-category').textContent = bmiCategory(latestBmi);
  const latestBmiFat = latest.bmiBodyFat ?? (1.20 * latestBmi + 0.23 * (latest.age || 30) - 10.8 * (latest.sex === 'male' ? 1 : 0) - 5.4);
  document.getElementById('progress-bmi-fat').textContent = latestBmiFat.toFixed(1);
  document.getElementById('bodyfat-change').innerHTML = previous ? `<b>${signedChange(latest.bodyFat - previous.bodyFat,'%')}</b> since last check-in` : 'First check-in saved';
  document.getElementById('weight-change').textContent = previous ? signedChange(latest.weight - previous.weight,' kg') : 'FIRST';
  document.getElementById('lean-change').textContent = previous ? signedChange(latest.leanMass - previous.leanMass,' kg') : 'FIRST';

  const values = history.map(item => item.bodyFat), rawMin = Math.min(...values), rawMax = Math.max(...values);
  const min = Math.floor(rawMin - 1), max = Math.ceil(rawMax + 1), range = Math.max(2,max-min);
  const points = history.map((item,index) => ({ x: history.length === 1 ? 165 : index * 330/(history.length-1), y: 12 + (max-item.bodyFat)/range*112 }));
  const line = points.map((point,index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  document.getElementById('progress-line').setAttribute('d',line);
  document.getElementById('progress-area').setAttribute('d',`${line} L${points[points.length-1].x.toFixed(1)} 140 L${points[0].x.toFixed(1)} 140 Z`);
  const dot = points[points.length-1]; document.getElementById('progress-dot').setAttribute('cx',dot.x); document.getElementById('progress-dot').setAttribute('cy',dot.y); document.getElementById('progress-dot').setAttribute('r','5');
  document.getElementById('chart-high').textContent = `${max}%`; document.getElementById('chart-mid').textContent = `${((max+min)/2).toFixed(1)}%`; document.getElementById('chart-low').textContent = `${min}%`;
  document.getElementById('chart-start').textContent = shortDate(first.date); document.getElementById('chart-end').textContent = shortDate(latest.date);
  document.getElementById('chart-empty').classList.toggle('hidden',history.length > 1);

  list.innerHTML = history.slice().reverse().map(item => `<article class="history-row"><span>${shortDate(item.date)}</span><div><small>BODY FAT</small><strong>${item.bodyFat.toFixed(1)}%</strong></div><div><small>WEIGHT</small><strong>${item.weight.toFixed(1)} kg</strong></div><div><small>LEAN</small><strong>${item.leanMass.toFixed(1)} kg</strong></div><div><small>BMI</small><strong>${(item.bmi || item.weight/((item.height/100)**2)).toFixed(1)}</strong></div></article>`).join('');
}

function updateBmiPreview() {
  const height = Number(document.getElementById('height').value);
  const weight = Number(document.getElementById('body-weight').value);
  if (!height || !weight) return;
  const bmi = weight / ((height/100) ** 2);
  const age = Number(document.getElementById('body-age').value) || 30;
  const sexValue = document.getElementById('sex').value;
  const bmiBodyFat = 1.20 * bmi + 0.23 * age - 10.8 * (sexValue === 'male' ? 1 : 0) - 5.4;
  document.getElementById('calculated-bmi').textContent = bmi.toFixed(1);
  document.getElementById('calculated-bmi-category').textContent = bmiCategory(bmi);
  document.getElementById('calculated-bmi-fat').textContent = `${bmiBodyFat.toFixed(1)}%`;
}
document.getElementById('height').addEventListener('input', updateBmiPreview);
document.getElementById('body-weight').addEventListener('input', updateBmiPreview);
document.getElementById('body-age').addEventListener('input', updateBmiPreview);
document.getElementById('sex').addEventListener('change', updateBmiPreview);

document.getElementById('body-form').addEventListener('submit', () => {
  const output = document.getElementById('calculated');
  const error = document.getElementById('body-error');
  if (!output.classList.contains('show') || error.classList.contains('show')) return;
  const bodyFat = Number.parseFloat(output.querySelector('strong').textContent);
  const weight = Number(document.getElementById('body-weight').value);
  if (!Number.isFinite(bodyFat) || !Number.isFinite(weight)) return;
  const height = Number(document.getElementById('height').value);
  const bmi = weight / ((height/100) ** 2);
  const age = Number(document.getElementById('body-age').value), sexValue = document.getElementById('sex').value;
  const bmiBodyFat = 1.20 * bmi + 0.23 * age - 10.8 * (sexValue === 'male' ? 1 : 0) - 5.4;
  const entry = { date: Date.now(), bodyFat, weight, bmi, bmiBodyFat, age, leanMass: weight * (1-bodyFat/100), height, waist: Number(document.getElementById('waist').value), neck: Number(document.getElementById('neck').value), hip: Number(document.getElementById('hip').value), sex: sexValue };
  const history = readCheckins(); history.push(entry); writeLocal('form-body-checkins',history.slice(-24));
  let note = output.querySelector('.saved-note'); if (!note) { note = document.createElement('small'); note.className = 'saved-note'; output.appendChild(note); }
  note.textContent = `Saved · lean mass ${entry.leanMass.toFixed(1)} kg`;
  document.getElementById('calculated-bmi').textContent = bmi.toFixed(1);
  document.getElementById('calculated-bmi-category').textContent = bmiCategory(bmi);
  document.getElementById('calculated-bmi-fat').textContent = `${bmiBodyFat.toFixed(1)}%`;
  renderProgress();
});

document.querySelector('[data-open="bodyfat"]').addEventListener('click', () => {
  const history = readCheckins(); if (!history.length) return;
  const latest = history[history.length-1];
  document.getElementById('body-weight').value = latest.weight;
  document.getElementById('height').value = latest.height;
  document.getElementById('waist').value = latest.waist;
  document.getElementById('neck').value = latest.neck;
  document.getElementById('hip').value = latest.hip || '';
  document.getElementById('sex').value = latest.sex;
  document.getElementById('body-age').value = latest.age || 30;
  document.querySelector('.hip-field').style.setProperty('display', latest.sex === 'female' ? 'block' : 'none','important');
  updateBmiPreview();
});
updateBmiPreview();
renderProgress();
