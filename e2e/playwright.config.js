import { defineConfig } from '@playwright/test';

// Avvia backend e frontend da solo prima dei test (e li richiude alla
// fine), così basta un comando per far girare tutto -- non serve avere
// già i due server accesi a mano in due terminali.
//
// NOTA: la prima volta che lanci "npx playwright test" da questa cartella,
// esegui prima "npx playwright install chromium" per scaricare il browser
// (una sola volta, poi resta installato).

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },

  webServer: [
    {
      command: 'npm start',
      cwd: '../backend',
      url: 'http://localhost:3001/',
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],

  // Usa Microsoft Edge già installato su Windows invece di scaricare un
  // Chromium separato -- utile se la rete blocca il download da
  // cdn.playwright.dev (succede spesso con reti universitarie/aziendali).
  projects: [
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 667 }, channel: 'msedge' },
    },
    {
      name: 'tablet',
      use: { viewport: { width: 768, height: 1024 }, channel: 'msedge' },
    },
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 900 }, channel: 'msedge' },
    },
  ],
});