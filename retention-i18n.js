(() => {
  const i18n = window.KinetiqI18n;
  if (!i18n?.registerTranslations) return;
  i18n.registerTranslations({
    ru: {
      'Add check-in': 'Добавить чек-ин',
      'Sleep + water needed': 'Нужны сон и вода',
      'Based on today’s sleep and water': 'На основе сна и воды сегодня',
      'Steady': 'Стабильно', 'Recover': 'Восстановление',
      'Log sleep and water to get a useful daily recommendation.': 'Запишите сон и воду, чтобы получить полезную рекомендацию.',
      'Manual meal': 'Ввести вручную', 'Repeat last meal': 'Повторить последнюю еду',
      'MANUAL MEAL': 'РУЧНОЙ ВВОД', 'Log what': 'Запишите, что', 'you ate.': 'вы съели.', 'Meal name': 'Название блюда', 'Calories': 'Калории', 'Add meal': 'Добавить еду',
      'Log a meal to unlock today’s nutrition insight.': 'Запишите еду, чтобы получить совет по питанию.',
      'PLAN BALANCE': 'БАЛАНС ПЛАНА', 'START': 'НАЧАТЬ', 'READY': 'ГОТОВО', '✓ DONE': '✓ ГОТОВО',
      'Build today’s': 'Создайте', 'workout': 'тренировку на сегодня', 'Choose place and focus': 'Выберите место и фокус',
      'Today’s workout': 'Тренировка на сегодня', 'is ready': 'готова', 'Training logged.': 'Тренировка записана.', 'Keep the rhythm.': 'Сохраняйте ритм.',
      'You’re all caught up.': 'Все просмотрено.', 'Useful updates will appear after you log activity.': 'Полезные обновления появятся после записи активности.'
    },
    tr: {
      'Add check-in': 'Kontrol ekle', 'Sleep + water needed': 'Uyku ve su gerekli', 'Based on today’s sleep and water': 'Bugünkü uyku ve suya göre', 'Steady': 'Dengeli', 'Recover': 'Toparlan',
      'Log sleep and water to get a useful daily recommendation.': 'Faydalı bir günlük öneri için uyku ve suyu kaydet.',
      'Manual meal': 'Manuel öğün', 'Repeat last meal': 'Son öğünü tekrarla', 'MANUAL MEAL': 'MANUEL ÖĞÜN', 'Log what': 'Yediğini', 'you ate.': 'kaydet.', 'Meal name': 'Öğün adı', 'Calories': 'Kalori', 'Add meal': 'Öğünü ekle',
      'Log a meal to unlock today’s nutrition insight.': 'Bugünün beslenme önerisini açmak için bir öğün kaydet.',
      'PLAN BALANCE': 'PLAN DENGESİ', 'START': 'BAŞLA', 'READY': 'HAZIR', '✓ DONE': '✓ TAMAM', 'Build today’s': 'Bugünkü', 'workout': 'antrenmanı oluştur', 'Choose place and focus': 'Yer ve odak seç',
      'Today’s workout': 'Bugünkü antrenman', 'is ready': 'hazır', 'Training logged.': 'Antrenman kaydedildi.', 'Keep the rhythm.': 'Ritmi koru.',
      'You’re all caught up.': 'Her şey tamam.', 'Useful updates will appear after you log activity.': 'Aktivite kaydettikten sonra faydalı güncellemeler burada görünür.'
    }
  });
  i18n.registerTranslations({
    ru: {
      'DAY': 'ДЕНЬ', 'goal': 'цель', 'eaten': 'съедено', 'SERVING': 'ПОРЦИЯ', 'BREAKFAST': 'ЗАВТРАК', 'LUNCH': 'ОБЕД', 'SNACK': 'ПЕРЕКУС', 'DINNER': 'УЖИН',
      'MEAL PLAN': 'ПЛАН ПИТАНИЯ', 'SCANNED': 'СКАН', 'REPEATED': 'ПОВТОР', 'MANUAL': 'ВРУЧНУЮ', 'Remove': 'Удалить',
      'Guest profile': 'Гостевой профиль', 'Log in from the Today tab': 'Войдите на вкладке «Сегодня»', 'Go to login': 'Перейти ко входу',
      'Log recovery to calculate readiness': 'Записать восстановление для расчета готовности', 'Edit today’s recovery check-in': 'Изменить сегодняшнее восстановление',
      'Plans against the daily targets saved on Home.': 'План по дневным целям, сохраненным на главной.', 'Uses a moderate 15% calorie reduction while protecting protein.': 'Умеренное снижение калорий на 15% с сохранением белка.', 'Uses a measured 12% calorie increase with additional protein and carbohydrates.': 'Контролируемое увеличение калорий на 12% с добавлением белка и углеводов.',
      'FAT-LOSS TARGET': 'ЦЕЛЬ СНИЖЕНИЯ ЖИРА', 'WEIGHT-GAIN TARGET': 'ЦЕЛЬ НАБОРА ВЕСА', 'MEAL PREFERENCES': 'НАСТРОЙКИ ПИТАНИЯ',
      'Forgot password?': 'Забыли пароль?', 'SECURE ACCOUNT': 'ЗАЩИТА АККАУНТА', 'Choose a new': 'Выберите новый', 'password.': 'пароль.', 'New password': 'Новый пароль', 'Update password': 'Обновить пароль'
    },
    tr: {
      'DAY': 'GÜN', 'goal': 'hedef', 'eaten': 'yenildi', 'SERVING': 'PORSİYON', 'BREAKFAST': 'KAHVALTI', 'LUNCH': 'ÖĞLE', 'SNACK': 'ARA ÖĞÜN', 'DINNER': 'AKŞAM',
      'MEAL PLAN': 'ÖĞÜN PLANI', 'SCANNED': 'TARANDI', 'REPEATED': 'TEKRAR', 'MANUAL': 'MANUEL', 'Remove': 'Kaldır',
      'Guest profile': 'Misafir profili', 'Log in from the Today tab': 'Bugün sekmesinden giriş yap', 'Go to login': 'Girişe git',
      'Log recovery to calculate readiness': 'Hazırlığı hesaplamak için toparlanmayı kaydet', 'Edit today’s recovery check-in': 'Bugünkü toparlanma kaydını düzenle',
      'Plans against the daily targets saved on Home.': 'Ana sayfada kaydedilen günlük hedeflere göre planlanır.', 'Uses a moderate 15% calorie reduction while protecting protein.': 'Proteini korurken kaloriyi ılımlı olarak %15 azaltır.', 'Uses a measured 12% calorie increase with additional protein and carbohydrates.': 'Ek protein ve karbonhidratla kaloriyi kontrollü olarak %12 artırır.',
      'FAT-LOSS TARGET': 'YAĞ KAYBI HEDEFİ', 'WEIGHT-GAIN TARGET': 'KİLO ALMA HEDEFİ', 'MEAL PREFERENCES': 'ÖĞÜN TERCİHLERİ',
      'Forgot password?': 'Şifreni mi unuttun?', 'SECURE ACCOUNT': 'GÜVENLİ HESAP', 'Choose a new': 'Yeni bir', 'password.': 'şifre seç.', 'New password': 'Yeni şifre', 'Update password': 'Şifreyi güncelle'
    }
  });
  i18n.registerTranslations({
    ru: {
      'EXERCISE': 'УПРАЖНЕНИЕ', 'OF': 'ИЗ',
      'MEAL PLAN SETUP': 'НАСТРОЙКА ПЛАНА ПИТАНИЯ', 'Food that fits': 'Еда, которая', 'your real life.': 'подходит вам.', 'DIET': 'ТИП ПИТАНИЯ', 'No dietary restriction': 'Без ограничений', 'Vegetarian': 'Вегетарианское', 'Vegan': 'Веганское',
      'Halal-friendly plan': 'План с учетом халяль', 'Excludes pork and alcohol. Verify halal certification when buying meat.': 'Исключает свинину и алкоголь. Проверяйте халяль-сертификат мяса.',
      'ALLERGIES': 'АЛЛЕРГИИ', 'dairy': 'молочное', 'eggs': 'яйца', 'nuts': 'орехи', 'gluten': 'глютен', 'soy': 'соя', 'fish': 'рыба', 'BUDGET': 'БЮДЖЕТ', 'Low cost': 'Низкий', 'Moderate': 'Средний', 'Flexible': 'Гибкий',
      'MAX PREP TIME': 'МАКС. ВРЕМЯ ГОТОВКИ', '5 minutes': '5 минут', '15 minutes': '15 минут', '30 minutes': '30 минут', 'MEALS PER DAY': 'ПРИЕМОВ ПИЩИ В ДЕНЬ', 'FOODS YOU DISLIKE': 'НЕЛЮБИМЫЕ ПРОДУКТЫ', 'Separate multiple foods with commas.': 'Перечисляйте продукты через запятую.', 'Save & rebuild meal plan': 'Сохранить и перестроить план'
    },
    tr: {
      'EXERCISE': 'EGZERSİZ', 'OF': '/',
      'MEAL PLAN SETUP': 'ÖĞÜN PLANI AYARI', 'Food that fits': 'Gerçek hayatına', 'your real life.': 'uyan yemekler.', 'DIET': 'BESLENME TÜRÜ', 'No dietary restriction': 'Beslenme kısıtı yok', 'Vegetarian': 'Vejetaryen', 'Vegan': 'Vegan',
      'Halal-friendly plan': 'Helal uyumlu plan', 'Excludes pork and alcohol. Verify halal certification when buying meat.': 'Domuz eti ve alkol içermez. Et alırken helal sertifikasını kontrol et.',
      'ALLERGIES': 'ALERJİLER', 'dairy': 'süt ürünleri', 'eggs': 'yumurta', 'nuts': 'kuruyemiş', 'gluten': 'gluten', 'soy': 'soya', 'fish': 'balık', 'BUDGET': 'BÜTÇE', 'Low cost': 'Ekonomik', 'Moderate': 'Orta', 'Flexible': 'Esnek',
      'MAX PREP TIME': 'AZAMİ HAZIRLIK SÜRESİ', '5 minutes': '5 dakika', '15 minutes': '15 dakika', '30 minutes': '30 dakika', 'MEALS PER DAY': 'GÜNLÜK ÖĞÜN', 'FOODS YOU DISLIKE': 'SEVMEDİĞİN YİYECEKLER', 'Separate multiple foods with commas.': 'Birden fazla yiyeceği virgülle ayır.', 'Save & rebuild meal plan': 'Kaydet ve öğün planını yenile'
    }
  });
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: i18n.currentLanguage?.() || document.documentElement.lang || 'en' } }));
})();
