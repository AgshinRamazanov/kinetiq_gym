const defaultReminders = { workout: { enabled: false, time: '18:00' }, meal: { enabled: false, time: '12:30' }, water: { enabled: false, hours: 2 }, weigh: { enabled: false, time: '08:00' }, photo: { enabled: false, time: '09:00' } };
let reminderSettings = { ...defaultReminders, ...readLocal('form-reminders', {}) };
Object.keys(defaultReminders).forEach(key => reminderSettings[key] = { ...defaultReminders[key], ...(reminderSettings[key] || {}) });

const reminderCopy = {
  en: {
    configure: 'Configure reminders', schedule: 'Schedule >', eyebrow: 'GENTLE NUDGES', titleA: 'Remember what', titleB: 'matters to you.', intro: 'Choose only the reminders that feel useful.',
    workout: 'Workout', workoutNote: 'Training time', meal: 'Meal', mealNote: 'Meal check-in', weigh: 'Weigh-in', weighNote: 'Weekly measurement', photo: 'Progress photo', photoNote: 'Monthly photo',
    water: 'Water', waterNote: 'Between 08:00 and 22:00', hour1: 'Every hour', hour2: 'Every 2h', hour3: 'Every 3h', hour4: 'Every 4h',
    permission: 'Browser notifications work on localhost and HTTPS. On iPhone, install the site to the Home Screen and allow notifications. While this prototype is not installed, keep the app open for reliable reminders.',
    save: 'Save reminders', saved: 'Reminder schedule saved.', justNow: 'JUST NOW',
    workoutTitle: 'Workout time', workoutBody: 'Your planned session is ready when you are.', mealTitle: 'Meal check-in', mealBody: 'A quick meal log keeps today\'s macros useful.',
    waterTitle: 'Water check', waterBody: 'A glass of water would fit nicely here.', weighTitle: 'Weekly weigh-in', weighBody: 'Use the same conditions for a cleaner trend.', photoTitle: 'Progress photo', photoBody: 'A consistent monthly photo can reveal quiet progress.'
  },
  ru: {
    configure: '\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u044F', schedule: '\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 >', eyebrow: '\u041C\u042F\u0413\u041A\u0418\u0415 \u041D\u0410\u041F\u041E\u041C\u0418\u041D\u0410\u041D\u0418\u042F', titleA: '\u041F\u043E\u043C\u043D\u0438\u0442\u0435 \u043E \u0442\u043E\u043C,', titleB: '\u0447\u0442\u043E \u0432\u0430\u043C \u0432\u0430\u0436\u043D\u043E.', intro: '\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u043B\u0435\u0437\u043D\u044B\u0435 \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u044F.',
    workout: '\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430', workoutNote: '\u0412\u0440\u0435\u043C\u044F \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438', meal: '\u0415\u0434\u0430', mealNote: '\u041E\u0442\u043C\u0435\u0442\u043A\u0430 \u0435\u0434\u044B', weigh: '\u0412\u0437\u0432\u0435\u0448\u0438\u0432\u0430\u043D\u0438\u0435', weighNote: '\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u043C\u0435\u0440', photo: '\u0424\u043E\u0442\u043E \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0430', photoNote: '\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u043E\u0435 \u0444\u043E\u0442\u043E',
    water: '\u0412\u043E\u0434\u0430', waterNote: '\u0421 08:00 \u0434\u043E 22:00', hour1: '\u041A\u0430\u0436\u0434\u044B\u0439 \u0447\u0430\u0441', hour2: '\u041A\u0430\u0436\u0434\u044B\u0435 2 \u0447', hour3: '\u041A\u0430\u0436\u0434\u044B\u0435 3 \u0447', hour4: '\u041A\u0430\u0436\u0434\u044B\u0435 4 \u0447',
    permission: '\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0440\u0430\u0431\u043E\u0442\u0430\u044E\u0442 \u043D\u0430 localhost \u0438 HTTPS. \u041D\u0430 iPhone \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0430\u0439\u0442 \u043D\u0430 \u044D\u043A\u0440\u0430\u043D \u00AB\u0414\u043E\u043C\u043E\u0439\u00BB \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F. \u041F\u043E\u043A\u0430 \u043F\u0440\u043E\u0442\u043E\u0442\u0438\u043F \u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D, \u0434\u0435\u0440\u0436\u0438\u0442\u0435 \u0435\u0433\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u043C.',
    save: '\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C', saved: '\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0439 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E.', justNow: '\u0422\u041E\u041B\u042C\u041A\u041E \u0427\u0422\u041E',
    workoutTitle: '\u0412\u0440\u0435\u043C\u044F \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438', workoutBody: '\u041F\u043B\u0430\u043D \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 \u0433\u043E\u0442\u043E\u0432, \u043A\u043E\u0433\u0434\u0430 \u0432\u044B \u0433\u043E\u0442\u043E\u0432\u044B.', mealTitle: '\u041E\u0442\u043C\u0435\u0442\u043A\u0430 \u0435\u0434\u044B', mealBody: '\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C \u0435\u0434\u044B \u0434\u0435\u043B\u0430\u0435\u0442 \u043C\u0430\u043A\u0440\u043E\u0441\u044B \u0434\u043D\u044F \u043F\u043E\u043B\u0435\u0437\u043D\u0435\u0435.',
    waterTitle: '\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0432\u043E\u0434\u044B', waterBody: '\u0421\u0442\u0430\u043A\u0430\u043D \u0432\u043E\u0434\u044B \u0441\u0435\u0439\u0447\u0430\u0441 \u0431\u044B \u043F\u043E\u0434\u043E\u0448\u0435\u043B.', weighTitle: '\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E\u0435 \u0432\u0437\u0432\u0435\u0448\u0438\u0432\u0430\u043D\u0438\u0435', weighBody: '\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0442\u0435 \u0436\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u0434\u043B\u044F \u0447\u0438\u0441\u0442\u043E\u0433\u043E \u0442\u0440\u0435\u043D\u0434\u0430.', photoTitle: '\u0424\u043E\u0442\u043E \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0430', photoBody: '\u041E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u043E\u0435 \u0444\u043E\u0442\u043E \u0440\u0430\u0437 \u0432 \u043C\u0435\u0441\u044F\u0446 \u043C\u043E\u0436\u0435\u0442 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0442\u0438\u0445\u0438\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441.'
  },
  tr: {
    configure: 'Hatirlaticilari ayarla', schedule: 'Program >', eyebrow: 'NAZIK HATIRLATICILAR', titleA: 'Senin icin onemli', titleB: 'olanlari hatirla.', intro: 'Sadece faydali hissettiren hatirlaticilari sec.',
    workout: 'Antrenman', workoutNote: 'Antrenman saati', meal: 'Ogun', mealNote: 'Ogun kontrolu', weigh: 'Tartilma', weighNote: 'Haftalik olcum', photo: 'Gelisim fotografi', photoNote: 'Aylik fotograf',
    water: 'Su', waterNote: '08:00 ile 22:00 arasi', hour1: 'Her saat', hour2: 'Her 2 saatte', hour3: 'Her 3 saatte', hour4: 'Her 4 saatte',
    permission: 'Tarayici bildirimleri localhost ve HTTPS uzerinde calisir. iPhone icin siteyi Ana Ekrana ekle ve bildirimlere izin ver. Bu prototip yuklu degilken guvenilir hatirlaticilar icin uygulamayi acik tut.',
    save: 'Hatirlaticilari kaydet', saved: 'Hatirlatici programi kaydedildi.', justNow: 'SIMDI',
    workoutTitle: 'Antrenman zamani', workoutBody: 'Planli seansin hazir oldugunda seni bekliyor.', mealTitle: 'Ogun kontrolu', mealBody: 'Kisa bir ogun kaydi bugunun makrolarini daha kullanisli yapar.',
    waterTitle: 'Su kontrolu', waterBody: 'Bir bardak su simdi iyi gider.', weighTitle: 'Haftalik tartilma', weighBody: 'Daha temiz trend icin ayni kosullari kullan.', photoTitle: 'Gelisim fotografi', photoBody: 'Aylik tutarli fotograf sessiz ilerlemeyi gosterebilir.'
  }
};

function reminderLang() { return window.KinetiqI18n?.currentLanguage?.() || document.documentElement.lang || 'en'; }
function reminderT(key) { return reminderCopy[reminderLang()]?.[key] || reminderCopy.en[key] || key; }

const notificationList = document.querySelector('#notifications .notification-list');
const reminderButton = document.createElement('button');
reminderButton.className = 'reminder-settings-button';
reminderButton.innerHTML = '<span data-reminder-copy="configure"></span><b data-reminder-copy="schedule"></b>';
notificationList.before(reminderButton);

const reminderRows = [['workout', 'workout', 'workoutNote'], ['meal', 'meal', 'mealNote'], ['weigh', 'weigh', 'weighNote'], ['photo', 'photo', 'photoNote']];
const reminderSheet = document.createElement('div');
reminderSheet.className = 'sheet';
reminderSheet.id = 'reminder-settings';
reminderSheet.setAttribute('aria-hidden', 'true');
reminderSheet.innerHTML = `<div class="sheet-content reminder-content"><button class="close" type="button">x</button><p class="eyebrow" data-reminder-copy="eyebrow"></p><h2><span data-reminder-copy="titleA"></span><br><em data-reminder-copy="titleB"></em></h2><p class="muted" data-reminder-copy="intro"></p><form id="reminder-form"><div class="reminder-list">${reminderRows.map(([key, title, note]) => `<label class="reminder-row"><input type="checkbox" name="${key}-enabled"><span><b data-reminder-copy="${title}"></b><small data-reminder-copy="${note}"></small></span><input type="time" name="${key}-time"></label>`).join('')}<label class="reminder-row water"><input type="checkbox" name="water-enabled"><span><b data-reminder-copy="water"></b><small data-reminder-copy="waterNote"></small></span><select name="water-hours"><option value="1" data-reminder-copy="hour1"></option><option value="2" data-reminder-copy="hour2"></option><option value="3" data-reminder-copy="hour3"></option><option value="4" data-reminder-copy="hour4"></option></select></label></div><p class="reminder-permission" data-reminder-copy="permission"></p><button class="primary" type="submit" data-reminder-copy="save"></button></form></div>`;
document.querySelector('.phone-shell').appendChild(reminderSheet);

function renderReminderLanguage() {
  document.querySelectorAll('[data-reminder-copy]').forEach(element => {
    element.textContent = reminderT(element.dataset.reminderCopy);
  });
}
function fillReminders() {
  const form = document.getElementById('reminder-form');
  ['workout', 'meal', 'weigh', 'photo'].forEach(key => {
    form.elements[`${key}-enabled`].checked = reminderSettings[key].enabled;
    form.elements[`${key}-time`].value = reminderSettings[key].time;
  });
  form.elements['water-enabled'].checked = reminderSettings.water.enabled;
  form.elements['water-hours'].value = reminderSettings.water.hours;
}
function reminderMessage(type) {
  return {
    workout: [reminderT('workoutTitle'), reminderT('workoutBody')],
    meal: [reminderT('mealTitle'), reminderT('mealBody')],
    water: [reminderT('waterTitle'), reminderT('waterBody')],
    weigh: [reminderT('weighTitle'), reminderT('weighBody')],
    photo: [reminderT('photoTitle'), reminderT('photoBody')]
  }[type];
}
function deliverReminder(type, id) {
  const sent = readLocal('form-reminders-sent', {});
  if (sent[id]) return;
  sent[id] = Date.now();
  writeLocal('form-reminders-sent', sent);
  const [title, body] = reminderMessage(type);
  homeToast(title);
  if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body, tag: id });
  const article = document.createElement('article');
  article.className = 'notification unread';
  article.innerHTML = `<i>*</i><div><strong>${title}</strong><p>${body}</p><small>${reminderT('justNow')}</small></div>`;
  notificationList.prepend(article);
}
function checkReminders() {
  const now = new Date(), today = localDateId(now), minutes = now.getHours() * 60 + now.getMinutes();
  ['workout', 'meal', 'weigh', 'photo'].forEach(type => {
    const item = reminderSettings[type];
    if (!item.enabled) return;
    const [h, m] = item.time.split(':').map(Number), due = h * 60 + m;
    const frequencyOk = type === 'weigh' ? now.getDay() === 1 : type === 'photo' ? now.getDate() === 1 : true;
    if (frequencyOk && minutes >= due && minutes < due + 2) deliverReminder(type, `${today}-${type}-${item.time}`);
  });
  if (reminderSettings.water.enabled && now.getHours() >= 8 && now.getHours() <= 22 && now.getMinutes() < 2 && (now.getHours() - 8) % Number(reminderSettings.water.hours) === 0) deliverReminder('water', `${today}-water-${now.getHours()}`);
}

reminderButton.addEventListener('click', () => {
  renderReminderLanguage();
  fillReminders();
  reminderSheet.classList.add('open');
  reminderSheet.setAttribute('aria-hidden', 'false');
});
reminderSheet.querySelector('.close').addEventListener('click', () => {
  reminderSheet.classList.remove('open');
  reminderSheet.setAttribute('aria-hidden', 'true');
});
document.getElementById('reminder-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  ['workout', 'meal', 'weigh', 'photo'].forEach(key => reminderSettings[key] = { enabled: form.elements[`${key}-enabled`].checked, time: form.elements[`${key}-time`].value });
  reminderSettings.water = { enabled: form.elements['water-enabled'].checked, hours: Number(form.elements['water-hours'].value) };
  if (Object.values(reminderSettings).some(item => item.enabled) && 'Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch {}
  }
  writeLocal('form-reminders', reminderSettings);
  reminderSheet.classList.remove('open');
  reminderSheet.setAttribute('aria-hidden', 'true');
  homeToast(reminderT('saved'));
});
window.addEventListener('languageChanged', renderReminderLanguage);
renderReminderLanguage();
fillReminders();
checkReminders();
setInterval(checkReminders, 30000);
