import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'php artisan serve',
    port: 8000,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
});
