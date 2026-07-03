/**
 * Auth setup — abogado
 * Hace login con la cuenta de test de abogado y guarda el estado de sesión.
 * Requiere: TEST_LAWYER_EMAIL y TEST_LAWYER_PASSWORD en .env.test
 */
import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const AUTH_FILE = path.join(__dirname, '../.auth/lawyer.json')

setup('autenticar como abogado', async ({ page }) => {
  const email = process.env.TEST_LAWYER_EMAIL
  const password = process.env.TEST_LAWYER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Faltan TEST_LAWYER_EMAIL o TEST_LAWYER_PASSWORD en .env.test'
    )
  }

  await page.goto('/iniciar-sesion')
  await page.waitForLoadState('networkidle')

  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')

  // Esperar redirect post-login
  await page.waitForURL('/', { timeout: 15000 })

  // Verificar que el usuario quedó autenticado yendo al dashboard
  await page.goto('/dashboard')
  await page.waitForURL('/dashboard', { timeout: 10000 })
  await expect(page.locator('text=Mi panel')).toBeVisible({ timeout: 10000 })

  // Guardar estado de sesión
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })
  await page.context().storageState({ path: AUTH_FILE })
  console.log('✅ Auth de abogado guardada en', AUTH_FILE)
})
