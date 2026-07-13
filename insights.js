const insightsAnchor = document.querySelector('#progress .history-title');
const insightsSection = document.createElement('section');
insightsSection.className = 'smart-insights';
insightsSection.innerHTML = '<div class="section-title"><div><span data-insight-i18n="thisWeek">THIS WEEK</span><h2 data-insight-i18n="heading">What the data says</h2></div></div><div class="insight-grid" id="insight-grid"></div>';
insightsAnchor.before(insightsSection);

const insightText = {
  en: {
    thisWeek: 'THIS WEEK', heading: 'What the data says', estimatedGoalDate: 'ESTIMATED GOAL DATE', weightTrend: 'WEIGHT TREND', waistChange: 'WAIST CHANGE', strength: 'STRENGTH', consistency: 'CONSISTENCY', avgCalories: 'AVG. CALORIES',
    notEnoughData: 'Not enough data', stable: 'Stable', collectingData: 'Building a baseline', twoCheckinsNeeded: 'Add at least three check-ins across 14 days for a responsible estimate.',
    aboutBodyFat: target => `about ${target}% body fat`, aboutKg: target => `about ${target} kg`, aboutLeanMass: target => `about ${target} kg lean mass`, goalRangeReached: 'Goal range reached', currentWithinTarget: label => `Your current estimate is already within the program target: ${label}.`,
    noDateYet: 'No date yet', trendNotMoving: 'The recent trend is not moving toward the program target yet.', overTwoYears: 'More than 2 years', rateTooSlow: 'The current pace is too slow for a useful short-term estimate.', projectionToward: label => `Projection toward ${label}, based on measured pace and not a guarantee.`,
    addAnotherCheckin: 'Add another check-in at least one week apart.', comparedCheckin: 'Compared with the latest check-in from at least six days ago.', waistNeeded: 'Waist measurements from two check-ins are needed.', waistMeasured: 'Measured change; normal daily fluctuations apply.', buildingBaseline: 'Building baseline', logSetsTwoWeeks: 'Log sets across two weeks to compare performance.', strengthEstimate: 'Estimated from your strongest logged sets versus last week.', consistencyNote: percent => `${percent}% of your planned weekly training frequency.`, noMealsLogged: 'No meals logged', logMealsAverage: 'Log meals to unlock a seven-day average.', averageAcross: days => `Average across ${days} logged day${days === 1 ? '' : 's'} this week.`
  },
  ru: {
    thisWeek: '\u042D\u0422\u0410 \u041D\u0415\u0414\u0415\u041B\u042F',
    heading: '\u0427\u0442\u043E \u0433\u043E\u0432\u043E\u0440\u044F\u0442 \u0434\u0430\u043D\u043D\u044B\u0435',
    estimatedGoalDate: '\u041E\u0426\u0415\u041D\u041A\u0410 \u0414\u0410\u0422\u042B \u0426\u0415\u041B\u0418',
    weightTrend: '\u0422\u0420\u0415\u041D\u0414 \u0412\u0415\u0421\u0410',
    waistChange: '\u0418\u0417\u041C\u0415\u041D\u0415\u041D\u0418\u0415 \u0422\u0410\u041B\u0418\u0418',
    strength: '\u0421\u0418\u041B\u0410',
    consistency: '\u0421\u0422\u0410\u0411\u0418\u041B\u042C\u041D\u041E\u0421\u0422\u042C',
    avgCalories: '\u0421\u0420. \u041A\u0410\u041B\u041E\u0420\u0418\u0418',
    notEnoughData: '\u041C\u0430\u043B\u043E \u0434\u0430\u043D\u043D\u044B\u0445',
    stable: '\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E',
    collectingData: '\u0421\u0431\u043E\u0440 \u0434\u0430\u043D\u043D\u044B\u0445',
    twoCheckinsNeeded: '\u0414\u043B\u044F \u043D\u0430\u0434\u0435\u0436\u043D\u043E\u0439 \u043E\u0446\u0435\u043D\u043A\u0438 \u043D\u0443\u0436\u043D\u044B \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0442\u0440\u0438 \u0447\u0435\u043A-\u0438\u043D\u0430 \u0437\u0430 14 \u0434\u043D\u0435\u0439.',
    aboutBodyFat: target => `\u043E\u043A\u043E\u043B\u043E ${target}% \u0436\u0438\u0440\u0430`,
    aboutKg: target => `\u043E\u043A\u043E\u043B\u043E ${target} \u043A\u0433`,
    aboutLeanMass: target => `\u043E\u043A\u043E\u043B\u043E ${target} \u043A\u0433 \u0441\u0443\u0445\u043E\u0439 \u043C\u0430\u0441\u0441\u044B`,
    goalRangeReached: '\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442',
    currentWithinTarget: label => `\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u043E\u0446\u0435\u043D\u043A\u0430 \u0443\u0436\u0435 \u0432 \u0446\u0435\u043B\u0435\u0432\u043E\u043C \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D\u0435 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B: ${label}.`,
    noDateYet: '\u0414\u0430\u0442\u044B \u043F\u043E\u043A\u0430 \u043D\u0435\u0442',
    trendNotMoving: '\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0442\u0440\u0435\u043D\u0434 \u043F\u043E\u043A\u0430 \u043D\u0435 \u0434\u0432\u0438\u0436\u0435\u0442\u0441\u044F \u043A \u0446\u0435\u043B\u0438 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B.',
    overTwoYears: '\u0411\u043E\u043B\u0435\u0435 2 \u043B\u0435\u0442',
    rateTooSlow: '\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0442\u0435\u043C\u043F \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0435\u0434\u043B\u0435\u043D\u043D\u044B\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u0435\u0437\u043D\u043E\u0439 \u043A\u0440\u0430\u0442\u043A\u043E\u0441\u0440\u043E\u0447\u043D\u043E\u0439 \u043E\u0446\u0435\u043D\u043A\u0438.',
    projectionToward: label => `\u041F\u0440\u043E\u0433\u043D\u043E\u0437 \u043A ${label} \u043F\u043E \u0438\u0437\u043C\u0435\u0440\u0435\u043D\u043D\u043E\u043C\u0443 \u0442\u0435\u043C\u043F\u0443, \u043D\u0435 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u044F.`,
    addAnotherCheckin: '\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0435\u0449\u0435 \u043E\u0434\u0438\u043D \u0447\u0435\u043A-\u0438\u043D \u0441 \u0440\u0430\u0437\u043D\u0438\u0446\u0435\u0439 \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0432 \u043D\u0435\u0434\u0435\u043B\u044E.',
    comparedCheckin: '\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u043E \u0441 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u043C \u0447\u0435\u043A-\u0438\u043D\u043E\u043C \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0448\u0435\u0441\u0442\u044C \u0434\u043D\u0435\u0439 \u043D\u0430\u0437\u0430\u0434.',
    waistNeeded: '\u041D\u0443\u0436\u043D\u044B \u0437\u0430\u043C\u0435\u0440\u044B \u0442\u0430\u043B\u0438\u0438 \u0438\u0437 \u0434\u0432\u0443\u0445 \u0447\u0435\u043A-\u0438\u043D\u043E\u0432.',
    waistMeasured: '\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u043D\u043E\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435; \u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u043A\u043E\u043B\u0435\u0431\u0430\u043D\u0438\u044F \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B.',
    buildingBaseline: '\u0421\u043E\u0431\u0438\u0440\u0430\u0435\u043C \u0431\u0430\u0437\u0443',
    logSetsTwoWeeks: '\u0417\u0430\u043F\u0438\u0441\u044B\u0432\u0430\u0439\u0442\u0435 \u043F\u043E\u0434\u0445\u043E\u0434\u044B \u0434\u0432\u0435 \u043D\u0435\u0434\u0435\u043B\u0438, \u0447\u0442\u043E\u0431\u044B \u0441\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0441\u0438\u043B\u0443.',
    strengthEstimate: '\u041E\u0446\u0435\u043D\u043A\u0430 \u043F\u043E \u0441\u0430\u043C\u044B\u043C \u0441\u0438\u043B\u044C\u043D\u044B\u043C \u0437\u0430\u043F\u0438\u0441\u0430\u043D\u043D\u044B\u043C \u043F\u043E\u0434\u0445\u043E\u0434\u0430\u043C \u043F\u0440\u043E\u0442\u0438\u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u0439 \u043D\u0435\u0434\u0435\u043B\u0438.',
    consistencyNote: percent => `${percent}% \u043E\u0442 \u043F\u043B\u0430\u043D\u043E\u0432\u043E\u0439 \u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E\u0439 \u0447\u0430\u0441\u0442\u043E\u0442\u044B \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043E\u043A.`,
    noMealsLogged: '\u0415\u0434\u0430 \u043D\u0435 \u0437\u0430\u043F\u0438\u0441\u0430\u043D\u0430',
    logMealsAverage: '\u0417\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u0435\u0434\u0443, \u0447\u0442\u043E\u0431\u044B \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0440\u0435\u0434\u043D\u0435\u0435 \u0437\u0430 7 \u0434\u043D\u0435\u0439.',
    averageAcross: days => `\u0421\u0440\u0435\u0434\u043D\u0435\u0435 \u0437\u0430 ${days} \u0437\u0430\u043F\u0438\u0441\u0430\u043D\u043D. \u0434\u043D. \u043D\u0430 \u044D\u0442\u043E\u0439 \u043D\u0435\u0434\u0435\u043B\u0435.`
  },
  tr: {
    thisWeek: 'BU HAFTA',
    heading: 'Veriler ne diyor',
    estimatedGoalDate: 'TAHMINI HEDEF TARIHI',
    weightTrend: 'KILO TRENDI',
    waistChange: 'BEL DEGISIMI',
    strength: 'KUVVET',
    consistency: 'DUZEN',
    avgCalories: 'ORT. KALORI',
    notEnoughData: 'Yeterli veri yok',
    stable: 'Stabil',
    collectingData: 'Veri toplaniyor',
    twoCheckinsNeeded: 'Guvenilir bir tahmin icin en az uc kontrol ve 14 gunluk veri gerekir.',
    aboutBodyFat: target => `yaklasik ${target}% yag orani`,
    aboutKg: target => `yaklasik ${target} kg`,
    aboutLeanMass: target => `yaklasik ${target} kg yagsiz kutle`,
    goalRangeReached: 'Hedef araligina ulasildi',
    currentWithinTarget: label => `Mevcut tahmin program hedefi olan ${label} araliginda.`,
    noDateYet: 'Henuz tarih yok',
    trendNotMoving: 'Son trend henuz program hedefine dogru ilerlemiyor.',
    overTwoYears: '2 yildan fazla',
    rateTooSlow: 'Mevcut hiz kisa vadeli faydali bir tahmin icin cok yavas.',
    projectionToward: label => `${label} hedefine dogru olcum hizina dayali projeksiyon, garanti degil.`,
    addAnotherCheckin: 'En az bir hafta arayla bir kontrol daha ekle.',
    comparedCheckin: 'En az alti gun onceki son kontrolunle karsilastirildi.',
    waistNeeded: 'Iki kontrolden bel olcumleri gerekiyor.',
    waistMeasured: 'Olculen degisim; gunluk dalgalanmalar normaldir.',
    buildingBaseline: 'Baz olusturuluyor',
    logSetsTwoWeeks: 'Performansi karsilastirmak icin iki hafta boyunca set kaydet.',
    strengthEstimate: 'Gecen haftaya karsi en guclu kayitli setlerinden tahmin edildi.',
    consistencyNote: percent => `Planlanan haftalik antrenman sikliginin %${percent} kadari.`,
    noMealsLogged: 'Ogun kaydi yok',
    logMealsAverage: 'Yedi gunluk ortalamayi acmak icin ogun kaydet.',
    averageAcross: days => `Bu hafta kayitli ${days} gunun ortalamasi.`
  }
};

function insightLang() {
  return window.KinetiqI18n?.currentLanguage?.() || document.documentElement.lang || 'en';
}
function insightT(key, ...args) {
  const value = insightText[insightLang()]?.[key];
  return typeof value === 'function' ? value(...args) : value || key;
}
function applyInsightLanguage() {
  document.querySelectorAll('[data-insight-i18n]').forEach(element => {
    element.textContent = insightT(element.dataset.insightI18n);
  });
}

const daysAgo = days => Date.now() - days * 86400000;
function changeText(value, unit) {
  if (value === null) return insightT('notEnoughData');
  if (Math.abs(value) < .05) return `${insightT('stable')} ${unit}`;
  return `${value > 0 ? '+' : '-'} ${Math.abs(value).toFixed(1)} ${unit}`;
}
function weeklyIntakes() {
  const values = [];
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date();
    day.setDate(day.getDate() - offset);
    const intake = readLocal(`form-daily-intake-${localDateId(day)}`, null);
    if (intake) values.push(Number(intake.calories) || 0);
  }
  return values;
}
function estimateGoal(checkins, goal) {
  const spanDays = checkins.length > 1 ? (checkins.at(-1).date - checkins[0].date) / 86400000 : 0;
  if (checkins.length < 3 || spanDays < 14) return { value: insightT('collectingData'), note: insightT('twoCheckinsNeeded') };
  const first = checkins[0], last = checkins[checkins.length - 1], days = Math.max(1, (last.date - first.date) / 86400000);
  let remaining, rate, label;
  if (goal === 'lose') {
    const target = last.sex === 'female' ? 28 : 20;
    remaining = last.bodyFat - target;
    rate = (first.bodyFat - last.bodyFat) / days;
    label = insightT('aboutBodyFat', target);
  } else if (goal === 'gain') {
    const target = first.weight * 1.08;
    remaining = target - last.weight;
    rate = (last.weight - first.weight) / days;
    label = insightT('aboutKg', target.toFixed(1));
  } else {
    const target = first.leanMass + 3;
    remaining = target - last.leanMass;
    rate = (last.leanMass - first.leanMass) / days;
    label = insightT('aboutLeanMass', target.toFixed(1));
  }
  if (remaining <= 0) return { value: insightT('goalRangeReached'), note: insightT('currentWithinTarget', label) };
  if (rate <= 0) return { value: insightT('noDateYet'), note: insightT('trendNotMoving') };
  const goalDays = Math.ceil(remaining / rate);
  if (goalDays > 730) return { value: insightT('overTwoYears'), note: insightT('rateTooSlow') };
  const date = new Date();
  date.setDate(date.getDate() + goalDays);
  return { value: date.toLocaleDateString(insightLang(), { month: 'short', day: 'numeric', year: 'numeric' }), note: insightT('projectionToward', label) };
}
function renderInsights() {
  applyInsightLanguage();
  const checkins = readLocal('form-body-checkins', []).filter(x => Number(x.date)).sort((a, b) => a.date - b.date), latest = checkins.at(-1), prior = checkins.filter(x => x.date <= daysAgo(6)).at(-1);
  const weightChange = latest && prior ? latest.weight - prior.weight : null, waistChange = latest && prior ? latest.waist - prior.waist : null;
  const sets = readLocal('form-workout-history', []), recentSets = sets.filter(x => x.date >= daysAgo(7)), olderSets = sets.filter(x => x.date >= daysAgo(14) && x.date < daysAgo(7));
  const best = items => items.reduce((top, x) => Math.max(top, (Number(x.weight) || 0) * (1 + (Number(x.reps) || 0) / 30) || Number(x.reps) || 0), 0), recentBest = best(recentSets), olderBest = best(olderSets), strength = olderBest ? ((recentBest - olderBest) / olderBest * 100) : null;
  const completions = readLocal('form-exercise-completions', []).filter(x => x.date >= daysAgo(7)), workoutDays = new Set(completions.map(x => localDateId(x.date))).size, setup = readLocal('form-onboarding', {}), targetDays = Number(setup.days) || 4, consistency = Math.min(100, Math.round(workoutDays / targetDays * 100));
  const calories = weeklyIntakes(), average = calories.length ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length) : null, goal = readLocal('form-training-goal', 'muscle'), projection = estimateGoal(checkins, goal);
  const cards = [
    [insightT('estimatedGoalDate'), projection.value, projection.note],
    [insightT('weightTrend'), changeText(weightChange, 'kg'), weightChange === null ? insightT('addAnotherCheckin') : insightT('comparedCheckin')],
    [insightT('waistChange'), changeText(waistChange, 'cm'), waistChange === null ? insightT('waistNeeded') : insightT('waistMeasured')],
    [insightT('strength'), strength === null ? insightT('buildingBaseline') : `${strength >= 0 ? '+' : ''}${strength.toFixed(1)}%`, strength === null ? insightT('logSetsTwoWeeks') : insightT('strengthEstimate')],
    [insightT('consistency'), `${workoutDays} / ${targetDays} ${insightLang() === 'en' ? 'days' : ''}`.trim(), insightT('consistencyNote', consistency)],
    [insightT('avgCalories'), average === null ? insightT('noMealsLogged') : `${average.toLocaleString()} kcal`, average === null ? insightT('logMealsAverage') : insightT('averageAcross', calories.length)]
  ];
  document.getElementById('insight-grid').innerHTML = cards.map(([label, value, note], i) => `<article class="insight-card"><span>${label}</span><strong class="${i === 0 || String(value).startsWith('+') ? 'positive' : ''}">${value}</strong><p>${note}</p></article>`).join('');
}
window.addEventListener('localDataChanged', renderInsights);
window.addEventListener('exerciseCompleted', renderInsights);
window.addEventListener('languageChanged', renderInsights);
renderInsights();
