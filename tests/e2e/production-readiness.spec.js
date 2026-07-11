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
