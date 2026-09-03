import { defineConfig, devices } from '@playwright/test';

/**
 * Los 3 flujos críticos (login+roles, expediente de comensal, asistencia con
 * descuento de inventario) corren contra la API real y Postgres — no hay
 * mocks. `db:seed` se corre antes vía globalSetup para partir de datos
 * conocidos en cada corrida.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5183',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm exec vite --port 5183 --strictPort',
    url: 'http://localhost:5183',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
