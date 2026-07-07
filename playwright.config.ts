import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.test') })

const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3001'

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    // ── Auth setup ──────────────────────────────────────────────
    {
      name: 'setup-client',
      testMatch: /auth\/client\.setup\.ts/,
    },
    {
      name: 'setup-lawyer',
      testMatch: /auth\/lawyer\.setup\.ts/,
    },

    // ── Tests con contexto de cliente ───────────────────────────
    {
      name: 'client',
      testMatch: /e2e\/(client|access-control).*\.spec\.ts/,
      dependencies: ['setup-client'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/client.json',
      },
    },

    // ── Tests con contexto de abogado ───────────────────────────
    {
      name: 'lawyer',
      testMatch: /e2e\/(lawyer|access-control).*\.spec\.ts/,
      dependencies: ['setup-lawyer'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/lawyer.json',
      },
    },

    // ── Tests sin autenticación ──────────────────────────────────
    {
      name: 'public',
      testMatch: /e2e\/public.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
