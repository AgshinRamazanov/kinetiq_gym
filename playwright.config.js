const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:8000', trace: 'retain-on-failure', serviceWorkers: 'block' },
  webServer: { command: 'python server.py', url: 'http://127.0.0.1:8000', reuseExistingServer: true },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 14'] } }
  ]
});
