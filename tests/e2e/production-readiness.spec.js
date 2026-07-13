const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('form-onboarding', JSON.stringify({ name: 'Test user', goal: 'muscle' })));
});

test('legal documents are available', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Privacy', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
  await page.getByRole('button', { name: 'Close privacy policy' }).click();
  await page.getByRole('button', { name: 'Health disclaimer' }).click();
  await expect(page.getByRole('heading', { name: 'Health disclaimer' })).toBeVisible();
});

test('signup requires legal consent', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.setLegalSignupMode(true));
  await expect(page.locator('#legal-consent')).toHaveAttribute('required', '');
});

test('home has no serious structural accessibility violations', async ({ page }) => {
  await page.goto('/');
  // Color contrast is tracked separately because the branded palette needs a
  // visual design review; this gate covers semantics, focus, labels, and ARIA.
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']).analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});

test('editorial dashboard and progress features render', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.readiness-dial')).toBeVisible();
  await expect(page.locator('.habit-row')).toBeVisible();
  await page.locator('.bottom-nav [data-nav="progress"]').click();
  await expect(page.locator('.consistency-grid')).toBeVisible();
  await expect(page.locator('.photo-pair')).toBeVisible();
});

test('today and train use the reconstructed information architecture', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.today-flow > .workout-card')).toBeVisible();
  await expect(page.locator('.today-flow > .habit-panel')).toBeVisible();
  await expect(page.locator('.today-metric-grid')).toBeVisible();
  await page.locator('.bottom-nav [data-nav="plan"]').click();
  await expect(page.locator('.program-intro')).toBeVisible();
  await expect(page.locator('.training-split')).toBeVisible();
  await expect(page.locator('.session-thumb')).toHaveCount(0);
  await expect(page.locator('.empty-workout')).toBeVisible();
});

test('generated workout keeps the compact redesigned exercise rows', async ({ page }) => {
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="plan"]').click();
  await page.locator('#generate-workout').click();
  await expect(page.locator('#session-list .session.generated')).toHaveCount(4);
  await expect(page.locator('#session-list .session.generated .session-thumb')).toHaveCount(4);
});

test('training choices and cancel flow control session visibility', async ({ page }) => {
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="plan"]').click();
  await expect(page.locator('.training-place [data-place="gym"]')).toBeVisible();
  await expect(page.locator('.training-place [data-place="home"]')).toBeVisible();
  await expect(page.locator('.training-split [data-body="core"]')).toBeVisible();
  await expect(page.locator('#session-list .session')).toHaveCount(0);
  await expect(page.locator('.empty-workout')).toBeVisible();
  await page.locator('.training-place [data-place="home"]').click();
  await page.locator('.training-split [data-body="full"]').click();
  await page.locator('#generate-workout').click();
  await expect(page.locator('#session-list .session.generated')).toHaveCount(4);
  await expect(page.locator('#cancel-workout-plan')).toBeVisible();
  await page.locator('#cancel-workout-plan').click();
  await expect(page.locator('#session-list .session')).toHaveCount(0);
  await expect(page.locator('.empty-workout')).toBeVisible();
});

test('exercise count supports presets and clamps custom amount to the selected pool', async ({ page }) => {
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="plan"]').click();
  await page.locator('.training-split [data-body="upper"]').click();
  await page.locator('.training-count [data-count="3"]').click();
  await page.locator('#generate-workout').click();
  await expect(page.locator('#session-list .session.generated')).toHaveCount(3);
  await page.locator('#cancel-workout-plan').click();
  await page.locator('.training-count [data-count="custom"]').click();
  await page.locator('#custom-exercise-count').fill('99');
  await expect(page.locator('#custom-exercise-count')).toHaveValue('11');
  await expect(page.locator('#custom-exercise-count')).toHaveAttribute('max', '11');
  await page.locator('#generate-workout').click();
  await expect(page.locator('#session-list .session.generated')).toHaveCount(11);
  await page.locator('#cancel-workout-plan').click();
  await page.locator('.training-split [data-body="core"]').click();
  await expect(page.locator('#custom-exercise-count')).toHaveAttribute('max', '5');
  await expect(page.locator('#custom-exercise-count')).toHaveValue('5');
});

test('push and pull generate different logical exercise pools', async ({ page }) => {
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="plan"]').click();
  await page.locator('.training-split [data-body="push"]').click();
  await page.locator('#generate-workout').click();
  await expect(page.locator('#session-list')).toContainText('Barbell Bench Press');
  await expect(page.locator('#session-list')).not.toContainText('Pull-Up / Chin-Up');
  await page.locator('#cancel-workout-plan').click();
  await page.locator('.training-split [data-body="pull"]').click();
  await page.locator('#generate-workout').click();
  await expect(page.locator('#session-list')).toContainText('Pull-Up / Chin-Up');
  await expect(page.locator('#session-list')).toContainText('Dumbbell Palm Rotational Bent Over Row');
  await expect(page.locator('#session-list')).not.toContainText('Barbell Bench Press');
});

test('new dashboard, train, progress, and legal content translate', async ({ page }) => {
  await page.goto('/');
  await page.locator('.topbar [data-language-select]').selectOption('ru');
  await expect(page.locator('.habit-panel')).toContainText('СЕРИИ ПРИВЫЧЕК');
  await page.locator('.bottom-nav [data-nav="plan"]').click();
  await expect(page.locator('#plan .page-header h1')).toHaveText('План тренировок');
  await expect(page.locator('.training-place')).toContainText('ГДЕ ВЫ ТРЕНИРУЕТЕСЬ?');
  await page.locator('.bottom-nav [data-nav="progress"]').click();
  await expect(page.locator('.progress-tabs')).toContainText('Эта неделя');
  await page.locator('[data-legal="privacy"]').click();
  await expect(page.locator('#privacy h2')).toHaveText('Политика конфиденциальности');
});

test('readiness stays honest until recovery data exists', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kinetiq-language', 'en'));
  await page.goto('/');
  await expect(page.locator('#readiness-score')).toHaveText('—');
  await expect(page.locator('#readiness-detail')).toContainText('Sleep + water needed');
  await page.evaluate(() => {
    const key = new Date().toISOString().slice(0, 10);
    localStorage.setItem('form-wellness-log', JSON.stringify({ [key]: { water: 2.5, sleep: 8 } }));
    window.dispatchEvent(new CustomEvent('localDataChanged', { detail: { key: 'form-wellness-log' } }));
  });
  await expect(page.locator('#readiness-score')).not.toHaveText('—');
  await expect(page.locator('#readiness-detail')).toContainText('Based on today’s sleep and water');
});

test('manual meal logging creates a real intake entry', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kinetiq-language', 'en'));
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="nutrition"]').click();
  await page.locator('#manual-meal-open').click();
  await page.locator('#manual-meal-form [name="name"]').fill('Test lunch');
  await page.locator('#manual-meal-form [name="calories"]').fill('520');
  await page.locator('#manual-meal-form [name="protein"]').fill('42');
  await page.locator('#manual-meal-form button[type="submit"]').click();
  await expect(page.locator('#logged-meals')).toContainText('Test lunch');
  await expect(page.locator('#tracked-calories')).toHaveText('520');
});

test('every meal uses its own local matching photo', async ({ page }) => {
  await page.goto('/');
  const catalog = await page.evaluate(() => allPreferenceMeals().map(meal => ({ name: meal.name, image: meal.image })));
  expect(catalog.length).toBeGreaterThanOrEqual(60);
  expect(catalog.every(meal => meal.image.startsWith('assets/meal-images/'))).toBe(true);
  expect(new Set(catalog.map(meal => meal.image)).size).toBe(catalog.length);
  const yogurt = catalog.find(meal => meal.name === 'Yogurt banana granola cup');
  const riceCakes = catalog.find(meal => meal.name === 'Rice cakes with cottage cheese');
  expect(yogurt?.image).toBe('assets/meal-images/yogurt-banana-granola-cup.webp');
  expect(riceCakes?.image).toBe('assets/meal-images/rice-cakes-with-cottage-cheese.webp');
  const renderedImages = await page.locator('#fuel-meal-list img').evaluateAll(images => images.map(image => image.src));
  expect(new Set(renderedImages).size).toBe(renderedImages.length);
});

test('goal-date projection waits for a responsible baseline', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('kinetiq-language', 'en');
    const now = Date.now();
    localStorage.setItem('form-body-checkins', JSON.stringify([
      { date: now - 8 * 86400000, bodyFat: 24, weight: 82, leanMass: 62, waist: 90, sex: 'male' },
      { date: now, bodyFat: 22, weight: 80, leanMass: 62.4, waist: 88, sex: 'male' }
    ]));
  });
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="progress"]').click();
  await expect(page.locator('#insight-grid .insight-card').first()).toContainText('Building a baseline');
  await expect(page.locator('#insight-grid .insight-card').first()).toContainText('three check-ins across 14 days');
});

test('exercise substitutions translate, stay in the same group, and return to the plan', async ({ page }) => {
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="plan"]').click();
  await page.locator('.training-split [data-body="push"]').click();
  await page.locator('#generate-workout').click();
  await page.locator('#session-list [data-exercise-name="Barbell Bench Press"]').click();
  await page.locator('#substitute-exercise').click();
  await page.locator('.substitution-reasons [data-reason="dislike"]').click();
  await expect(page.locator('#substitution-results')).toContainText('Push-Up');
  await expect(page.locator('#substitution-results')).not.toContainText('Pull-Up / Chin-Up');
  const swapAudit = await page.evaluate(() => {
    const options = [...document.querySelectorAll('#substitution-results .substitution-option b')].map(item => item.textContent);
    const session = [...document.querySelectorAll('#session-list [data-exercise-name]')].map(item => item.dataset.exerciseName);
    const pushPool = [...window.getTrainingExercisePool('home', 'push'), ...window.getTrainingExercisePool('gym', 'push')];
    return {
      allFromPush: options.every(name => pushPool.includes(name)),
      duplicates: options.filter(name => session.includes(name))
    };
  });
  expect(swapAudit.allFromPush).toBe(true);
  expect(swapAudit.duplicates).toEqual([]);
  await page.locator('#substitution-results .substitution-option').first().click();
  await expect(page.locator('#exercise-substitution')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#workout')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#session-list')).toContainText('SUBSTITUTED');
  const sessionNames = await page.locator('#session-list [data-exercise-name]').evaluateAll(rows => rows.map(row => row.dataset.exerciseName));
  expect(new Set(sessionNames).size).toBe(sessionNames.length);
  await page.evaluate(() => window.KinetiqI18n.setLanguage('tr'));
  await page.locator('#session-list [data-exercise-name]').first().click();
  await expect(page.locator('#substitute-exercise')).toContainText('Egzersizi değiştir');
  await page.locator('#substitute-exercise').click();
  await expect(page.locator('#exercise-substitution')).toContainText('AKILLI DEĞİŞİM');
  await expect(page.locator('#exercise-substitution')).toContainText('Ekipman yok');
});

test('core plan supports generation, videos, category-safe swaps, and no duplicates', async ({ page }) => {
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="plan"]').click();
  await page.locator('.training-split [data-body="core"]').click();
  await page.locator('.training-count [data-count="5"]').click();
  await page.locator('#generate-workout').click();
  await expect(page.locator('#session-list [data-exercise-name]')).toHaveCount(5);
  await page.locator('#session-list [data-exercise-name]').first().click();
  await expect(page.locator('#workout')).toHaveClass(/open/);
  await expect(page.locator('#exercise-title')).not.toBeEmpty();
  await page.locator('#substitute-exercise').click();
  await page.locator('.substitution-reasons [data-reason="different"]').click();
  const audit = await page.evaluate(() => {
    const options = [...document.querySelectorAll('#substitution-results .substitution-option b')].map(item => item.textContent);
    const session = [...document.querySelectorAll('#session-list [data-exercise-name]')].map(item => item.dataset.exerciseName);
    const corePool = [...window.getTrainingExercisePool('home', 'core'), ...window.getTrainingExercisePool('gym', 'core')];
    return {
      optionCount: options.length,
      allFromCore: options.every(name => corePool.includes(name)),
      hasDuplicate: options.some(name => session.includes(name))
    };
  });
  expect(audit.optionCount).toBeGreaterThan(0);
  expect(audit.allFromCore).toBe(true);
  expect(audit.hasDuplicate).toBe(false);
});

test('progress range tabs filter check-in history', async ({ page }) => {
  await page.addInitScript(() => {
    const day = 86400000;
    localStorage.setItem('form-body-checkins', JSON.stringify([
      { date: Date.now() - 10 * day, bodyFat: 20, weight: 80, leanMass: 64, height: 180, age: 30, sex: 'male' },
      { date: Date.now() - 2 * day, bodyFat: 19, weight: 79, leanMass: 64, height: 180, age: 30, sex: 'male' }
    ]));
  });
  await page.goto('/');
  await page.locator('.bottom-nav [data-nav="progress"]').click();
  await expect(page.locator('#checkin-history .history-row')).toHaveCount(1);
  await page.locator('.progress-tabs [data-range="28"]').click();
  await expect(page.locator('.progress-tabs [data-range="28"]')).toHaveClass(/active/);
  await expect(page.locator('#checkin-history .history-row')).toHaveCount(2);
});

test('feature-opened popup can always close with x', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('login').classList.add('open'));
  await expect(page.locator('#login')).not.toHaveAttribute('inert', '');
  await page.locator('#login [data-close]').click();
  await expect(page.locator('#login')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#login')).toHaveAttribute('inert', '');
});
