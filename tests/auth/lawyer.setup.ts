/**
 * Auth setup — abogado
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
    throw new Error('Faltan TEST_LAWYER_EMAIL o TEST_LAWYER_PASSWORD en .env.test')
  }

  await page.goto('/iniciar-sesion')
  await page.waitForLoadState('networkidle')

  // Verificar que el formulario cargó
  await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 })

  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')

  // Esperar: o navega fuera del login, o aparece un error
  await Promise.race([
    page.waitForURL((url) => !url.pathname.includes('iniciar-sesion'), { timeout: 20000 }),
    page.waitForSelector('[data-error], .text-red', { timeout: 20000 }),
  ]).catch(() => {})

  // Si seguimos en el login, fallar con mensaje útil
  const currentUrl = page.url()
  if (currentUrl.includes('iniciar-sesion')) {
    const errorText = await page.locator('text=/incorrectos|invalid|error/i').textContent().catch(() => 'sin mensaje')
    throw new Error(`Login falló para ${email}. Error en página: "${errorText}". URL: ${currentUrl}`)
  }

  // Ir al dashboard y confirmar que cargó
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  // Esperar que aparezca "Mi panel"
  await expect(page.getByText('Mi panel')).toBeVisible({ timeout: 15000 })

  // Guardar estado de sesión
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })
  await page.context().storageState({ path: AUTH_FILE })
  console.log('✅ Auth de abogado guardada en', AUTH_FILE)
})
