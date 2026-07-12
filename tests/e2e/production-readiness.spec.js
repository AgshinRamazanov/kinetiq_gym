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
  await expect(page.locator('#session-list .session')).toHaveCount(0);
  await expect(page.locator('.empty-workout')).toBeVisible();
  await page.locator('.training-place [data-place="home"]').click();
  await page.locator('.training-split [data-body="full"]').click();
  await page.locator('#generate-workout').click();
  await expect(page.locator('#session-list .session.generated')).toHaveCount(5);
  await expect(page.locator('#cancel-workout-plan')).toBeVisible();
  await page.locator('#cancel-workout-plan').click();
  await expect(page.locator('#session-list .session')).toHaveCount(0);
  await expect(page.locator('.empty-workout')).toBeVisible();
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
  await page.locator('#substitution-results .substitution-option').first().click();
  await expect(page.locator('#exercise-substitution')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#workout')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#session-list')).toContainText('SUBSTITUTED');
  await page.evaluate(() => window.KinetiqI18n.setLanguage('tr'));
  await page.locator('#session-list [data-exercise-name]').first().click();
  await expect(page.locator('#substitute-exercise')).toContainText('Egzersizi değiştir');
  await page.locator('#substitute-exercise').click();
  await expect(page.locator('#exercise-substitution')).toContainText('AKILLI DEĞİŞİM');
  await expect(page.locator('#exercise-substitution')).toContainText('Ekipman yok');
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
